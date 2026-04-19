const CircuitBreaker = require("opossum");
const Activity = require("../models/Activity");
const BehavioralEvent = require("../models/BehavioralEvent");
const Product = require("../models/Product");
const User = require("../models/User");

// ── Event weight map (matches ML training pipeline) ──────────────────────────
const EVENT_WEIGHTS = {
  view: 1,
  click: 1.5,
  add_to_cart: 2,
  purchase: 5,
  rec_click: 1.5,
};

// Map legacy action names → BehavioralEvent eventType
const ACTION_TO_EVENT_TYPE = {
  view: "view",
  click: "click",
  add_cart: "add_to_cart",
  add_to_cart: "add_to_cart",
  purchase: "purchase",
  rec_click: "rec_click",
  remove_cart: null, // no weight, skip
};

// ── FastAPI caller ────────────────────────────────────────────────────────────
async function callFastAPI(userId, placement, n, filters = {}, preferences = [], keywords = null) {
  const fastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 500);
  try {
    const response = await fetch(`${fastApiUrl}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId ? userId.toString() : null,
        placement,
        n,
        filters: { excludeOos: false, ...filters },
        preferences,
        keywords,
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`FastAPI responded with status: ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// ── Circuit breaker (opossum) ────────────────────────────────────────────────
const breakerOptions = {
  timeout: 500,                    // ms — fail fast
  errorThresholdPercentage: 50,    // open circuit when ≥50% of last N calls fail
  resetTimeout: 60000,             // ms — try again after 60s
  volumeThreshold: 5,              // min requests before measuring error %
};

const breaker = new CircuitBreaker(callFastAPI, breakerOptions);

// Fallback: featured products when circuit is open
breaker.fallback(async (userId, placement, n, filters, preferences, keywords) => {
  const products = await Product.find({ isActive: true, featured: true }).limit(n);
  return {
    productIds: products.map((p) => p._id.toString()),
    scores: [],
    model_version: "fallback",
  };
});

breaker.on("open", () => console.warn("[CircuitBreaker] OPEN — FastAPI unreachable, using fallback"));
breaker.on("halfOpen", () => console.info("[CircuitBreaker] HALF-OPEN — testing FastAPI..."));
breaker.on("close", () => console.info("[CircuitBreaker] CLOSED — FastAPI recovered"));

// ── Controllers ───────────────────────────────────────────────────────────────

// @desc  Personalized AI recommendations (authenticated user)
// @route GET /api/ai/recommendations
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const placement = req.query.placement || "homepage";
    const n = parseInt(req.query.n) || 8;

    const filters = {};
    if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice);

    const preferences = req.query.preferences
      ? req.query.preferences.split(',').filter(Boolean)
      : [];
    const keywords = req.query.keywords || null;

    const data = await breaker.fire(userId, placement, n, filters, preferences, keywords);

    // Hydrate product details from MongoDB
    const products = await Product.find({ _id: { $in: data.productIds }, isActive: true });

    // Preserve the order returned by FastAPI
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const orderedProducts = data.productIds
      .map((id) => productMap.get(id))
      .filter(Boolean);

    const isAI = data.model_version !== "fallback";
    res.json({
      success: true,
      products: orderedProducts,
      scores: data.scores,
      type: isAI ? "personalized_ai" : "featured_fallback",
      message: isAI ? "Gợi ý thông minh từ AI Model" : "Hiển thị sản phẩm nổi bật",
      model_version: data.model_version,
      circuit_state: breaker.opened ? "open" : "closed",
    });
  } catch (err) {
    console.error("Recommendation error:", err.message);
    const products = await Product.find({ isActive: true, featured: true }).limit(8);
    res.json({ success: true, products, type: "featured_fallback", message: "Lỗi AI, hiển thị SP nổi bật" });
  }
};

// @desc  Track user activity (authenticated) — writes to both Activity and BehavioralEvent
// @route POST /api/ai/track
const trackActivity = async (req, res) => {
  try {
    const { productId, action } = req.body;
    const userId = req.user._id;

    // Legacy Activity record (for marketing cron)
    await Activity.create({ user: userId, product: productId, action });

    // BehavioralEvent record (for ML training pipeline)
    const eventType = ACTION_TO_EVENT_TYPE[action];
    if (eventType) {
      await BehavioralEvent.create({
        userId,
        productId,
        eventType,
        weight: EVENT_WEIGHTS[eventType] || 1,
        metadata: {
          sessionId: req.headers["x-session-id"] || null,
          placement: req.body.placement || "unknown",
        },
      });
    }

    // Cart abandonment tracking
    if (action === "add_cart") {
      await User.findByIdAndUpdate(userId, {
        cartAbandonedAt: new Date(),
        cartAbandonedNotified: false,
      });
    }
    if (action === "purchase" || action === "remove_cart") {
      await User.findByIdAndUpdate(userId, {
        cartAbandonedAt: null,
        cartAbandonedNotified: false,
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Track event from unauthenticated / anonymous sessions
// @route POST /api/ai/track-public
const trackPublicEvent = async (req, res) => {
  try {
    const { productId, eventType, userId, metadata } = req.body;

    if (!productId || !eventType) {
      return res.status(400).json({ success: false, message: "productId and eventType are required" });
    }
    if (!EVENT_WEIGHTS[eventType]) {
      return res.status(400).json({ success: false, message: `Invalid eventType: ${eventType}` });
    }

    await BehavioralEvent.create({
      userId: userId || null,
      productId,
      eventType,
      weight: EVENT_WEIGHTS[eventType],
      metadata: metadata || {},
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPersonalizedRecommendations, trackActivity, trackPublicEvent };
