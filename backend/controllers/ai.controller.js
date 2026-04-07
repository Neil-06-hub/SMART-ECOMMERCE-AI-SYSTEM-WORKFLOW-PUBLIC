const Activity = require("../models/Activity");
const Product = require("../models/Product");
const User = require("../models/User");
const { getCollaborativeRecommendations } = require("../services/recommendation.service");

// @desc  Lấy gợi ý sản phẩm cá nhân hóa cho user (Home page)
// @route GET /api/ai/recommendations
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Lấy lịch sử hoạt động gần nhất
    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("product", "tags category");

    if (activities.length === 0) {
      // Nếu chưa có lịch sử -> trả về sản phẩm nổi bật
      const products = await Product.find({ isActive: true, featured: true }).limit(8);
      return res.json({ success: true, products, type: "featured", message: "Sản phẩm nổi bật" });
    }

    const recommendations = await getCollaborativeRecommendations(userId, activities);
    res.json({ success: true, products: recommendations, type: "personalized", message: "Gợi ý dành riêng cho bạn" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Track hoạt động thêm vào giỏ hàng
// @route POST /api/ai/track
const trackActivity = async (req, res) => {
  try {
    const { productId, action } = req.body;
    await Activity.create({ user: req.user._id, product: productId, action });

    // Nếu thêm vào giỏ -> cập nhật cartAbandonedAt để trigger marketing sau 24h
    if (action === "add_cart") {
      await User.findByIdAndUpdate(req.user._id, {
        cartAbandonedAt: new Date(),
        cartAbandonedNotified: false,
      });
    }
    if (action === "purchase" || action === "remove_cart") {
      await User.findByIdAndUpdate(req.user._id, {
        cartAbandonedAt: null,
        cartAbandonedNotified: false,
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPersonalizedRecommendations, trackActivity };
