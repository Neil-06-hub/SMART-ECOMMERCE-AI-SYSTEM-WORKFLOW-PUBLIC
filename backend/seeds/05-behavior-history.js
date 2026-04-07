/**
 * Seed Script 05 — Behavioral Event History
 * Generates ~2000 behavioral events for existing users across products.
 * Required for Phase 2 ML training pipeline.
 *
 * Run: node backend/seeds/05-behavior-history.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Product = require("../models/Product");
const BehavioralEvent = require("../models/BehavioralEvent");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/smart-ecommerce";

const EVENT_WEIGHTS = {
  view: 1,
  click: 1.5,
  add_to_cart: 2,
  purchase: 5,
  rec_click: 1.5,
};

// Weighted random choice
function weightedRandom(choices, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < choices.length; i++) {
    r -= weights[i];
    if (r <= 0) return choices[i];
  }
  return choices[choices.length - 1];
}

// Random date within the last N days
function randomDateWithinDays(days) {
  const now = Date.now();
  const past = now - days * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

// Generate a realistic behavior sequence for a user
function generateUserEvents(userId, products, userPreferences) {
  const events = [];

  // Filter preferred products (by category preference)
  const preferredProducts = products.filter(
    (p) =>
      userPreferences.length === 0 ||
      userPreferences.some((pref) =>
        p.category.toLowerCase().includes(pref.toLowerCase())
      )
  );

  const primaryPool =
    preferredProducts.length >= 5 ? preferredProducts : products;
  const secondaryPool = products;

  // Each user interacts with 5-15 products
  const numProductInteractions = 5 + Math.floor(Math.random() * 11);

  for (let i = 0; i < numProductInteractions; i++) {
    // 70% chance to pick from preferred pool
    const pool =
      Math.random() < 0.7 ? primaryPool : secondaryPool;
    const product = pool[Math.floor(Math.random() * pool.length)];
    const productId = product._id;

    // Always at least a view
    events.push({
      userId,
      productId,
      eventType: "view",
      weight: EVENT_WEIGHTS.view,
      timestamp: randomDateWithinDays(90),
      metadata: { placement: "homepage" },
    });

    // 60% chance to click
    if (Math.random() < 0.6) {
      events.push({
        userId,
        productId,
        eventType: "click",
        weight: EVENT_WEIGHTS.click,
        timestamp: randomDateWithinDays(90),
        metadata: { placement: "homepage" },
      });
    }

    // 35% chance to add to cart
    if (Math.random() < 0.35) {
      events.push({
        userId,
        productId,
        eventType: "add_to_cart",
        weight: EVENT_WEIGHTS.add_to_cart,
        timestamp: randomDateWithinDays(60),
        metadata: { placement: "pdp" },
      });
    }

    // 15% chance to purchase
    if (Math.random() < 0.15) {
      events.push({
        userId,
        productId,
        eventType: "purchase",
        weight: EVENT_WEIGHTS.purchase,
        timestamp: randomDateWithinDays(60),
        metadata: { placement: "cart" },
      });
    }

    // 20% chance of rec_click (from AI recommendations)
    if (Math.random() < 0.2) {
      events.push({
        userId,
        productId,
        eventType: "rec_click",
        weight: EVENT_WEIGHTS.rec_click,
        timestamp: randomDateWithinDays(30),
        metadata: { placement: "homepage" },
      });
    }
  }

  return events;
}

const seedBehaviorHistory = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // Fetch existing users (customers only) and products
    const users = await User.find({ role: "customer" }).select(
      "_id preferences"
    );
    const products = await Product.find({ isActive: true }).select(
      "_id category tags"
    );

    if (users.length === 0) {
      console.error(
        "No users found. Run earlier seed scripts first (seed.js to create users)."
      );
      process.exit(1);
    }
    if (products.length === 0) {
      console.error(
        "No products found. Run seed.js to create products first."
      );
      process.exit(1);
    }

    console.log(
      `Found ${users.length} users and ${products.length} products.`
    );

    // Clear existing behavioral events
    await BehavioralEvent.deleteMany({});
    console.log("Cleared existing behavioral events...");

    // Generate events for all users
    let allEvents = [];
    for (const user of users) {
      const userPrefs = user.preferences || [];
      const events = generateUserEvents(user._id, products, userPrefs);
      allEvents = allEvents.concat(events);
    }

    // Insert in batches of 500
    const batchSize = 500;
    let inserted = 0;
    for (let i = 0; i < allEvents.length; i += batchSize) {
      const batch = allEvents.slice(i, i + batchSize);
      await BehavioralEvent.insertMany(batch, { ordered: false });
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${allEvents.length} events...`);
    }

    console.log(
      `\nDone! Created ${allEvents.length} behavioral events for ${users.length} users.`
    );
    console.log(
      "Event breakdown:",
      allEvents.reduce((acc, e) => {
        acc[e.eventType] = (acc[e.eventType] || 0) + 1;
        return acc;
      }, {})
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding behavior history:", error);
    process.exit(1);
  }
};

seedBehaviorHistory();
