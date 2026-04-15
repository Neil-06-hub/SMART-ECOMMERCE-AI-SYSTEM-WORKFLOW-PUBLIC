/**
 * Seed Script 06 — Feature Snapshots
 * Aggregates behavioral_events + orders to compute feature snapshots per user.
 * These snapshots are consumed by the FastAPI training pipeline.
 *
 * Run: node backend/seeds/06-feature-snapshots.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product"); // required for BehavioralEvent.populate("productId")
const BehavioralEvent = require("../models/BehavioralEvent");
const FeatureSnapshot = require("../models/FeatureSnapshot");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/smart-ecommerce";

// Score recency (days since last purchase): lower = better = higher score
function scoreRecency(daysSince) {
  if (daysSince <= 7) return 5;
  if (daysSince <= 30) return 4;
  if (daysSince <= 90) return 3;
  if (daysSince <= 180) return 2;
  return 1;
}

// Score frequency (orders per month)
function scoreFrequency(ordersPerMonth) {
  if (ordersPerMonth >= 4) return 5;
  if (ordersPerMonth >= 2) return 4;
  if (ordersPerMonth >= 1) return 3;
  if (ordersPerMonth >= 0.5) return 2;
  return 1;
}

// Score monetary (avg order value in VND)
function scoreMonetary(avgValue) {
  if (avgValue >= 10000000) return 5; // >= 10M VND
  if (avgValue >= 5000000) return 4;  // >= 5M VND
  if (avgValue >= 2000000) return 3;  // >= 2M VND
  if (avgValue >= 500000) return 2;   // >= 500K VND
  return 1;
}

/**
 * Core seeding logic — can be called from seed.js (already connected) or standalone.
 */
const seedFeatureSnapshots = async () => {
    const users = await User.find({ role: "customer" }).select("_id");

    if (users.length === 0) {
      throw new Error("No users found. Run seed.js to create users first.");
    }

    console.log(`Processing feature snapshots for ${users.length} users...`);

    // Clear existing snapshots
    await FeatureSnapshot.deleteMany({});
    console.log("Cleared existing feature snapshots...");

    const snapshotDate = new Date();
    const ninetyDaysAgo = new Date(
      Date.now() - 90 * 24 * 60 * 60 * 1000
    );

    let processedCount = 0;
    const snapshots = [];

    for (const user of users) {
      const userId = user._id;

      // 1. Get behavioral events for this user (last 90 days)
      const events = await BehavioralEvent.find({
        userId,
        timestamp: { $gte: ninetyDaysAgo },
      })
        .populate("productId", "category tags")
        .sort({ timestamp: -1 })
        .lean();

      // 2. Compute recent views (last 20 unique products viewed)
      const viewedProductIds = [];
      const seenIds = new Set();
      for (const e of events) {
        if (
          (e.eventType === "view" || e.eventType === "click") &&
          e.productId
        ) {
          const pidStr = e.productId._id
            ? e.productId._id.toString()
            : e.productId.toString();
          if (!seenIds.has(pidStr)) {
            seenIds.add(pidStr);
            viewedProductIds.push(
              e.productId._id ? e.productId._id : e.productId
            );
          }
        }
        if (viewedProductIds.length >= 20) break;
      }

      // 3. Category interaction counts
      const categoryInteractions = {};
      for (const e of events) {
        if (e.productId && e.productId.category) {
          const cat = e.productId.category;
          categoryInteractions[cat] =
            (categoryInteractions[cat] || 0) + e.weight;
        }
      }

      // 4. Get orders for this user
      const orders = await Order.find({ user: userId })
        .select("totalAmount items orderStatus createdAt")
        .lean();

      const completedOrders = orders.filter((o) =>
        ["delivered", "confirmed", "shipping"].includes(o.orderStatus)
      );

      const totalOrderCount = completedOrders.length;
      const avgOrderValue =
        totalOrderCount > 0
          ? completedOrders.reduce((sum, o) => sum + o.totalAmount, 0) /
            totalOrderCount
          : 0;

      // Frequency: orders per month over last 6 months
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      const recentOrders = completedOrders.filter(
        (o) => new Date(o.createdAt) >= sixMonthsAgo
      );
      const purchaseFrequency = recentOrders.length / 6;

      // Days since last purchase
      let daysSinceLastPurchase = 999;
      if (completedOrders.length > 0) {
        const latest = completedOrders.reduce((a, b) =>
          new Date(a.createdAt) > new Date(b.createdAt) ? a : b
        );
        daysSinceLastPurchase = Math.floor(
          (Date.now() - new Date(latest.createdAt)) / (1000 * 60 * 60 * 24)
        );
      }

      // 5. Purchased categories
      const purchasedCategories = [
        ...new Set(
          completedOrders.flatMap((o) =>
            o.items.map((i) => i.name).filter(Boolean)
          )
        ),
      ];

      // 6. RFM scores
      const rfmScores = {
        r: scoreRecency(daysSinceLastPurchase),
        f: scoreFrequency(purchaseFrequency),
        m: scoreMonetary(avgOrderValue),
      };

      snapshots.push({
        userId,
        snapshotDate,
        recentViews: viewedProductIds,
        purchasedCategories,
        avgOrderValue,
        purchaseFrequency,
        daysSinceLastPurchase,
        totalOrderCount,
        rfmScores,
        categoryInteractions,
      });

      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`Processed ${processedCount}/${users.length} users...`);
      }
    }

    // Bulk insert all snapshots
    await FeatureSnapshot.insertMany(snapshots, { ordered: false });

    console.log(`\n✅ Created ${snapshots.length} feature snapshots.`);
    console.log("RFM distribution:", {
      avgR: (snapshots.reduce((s, x) => s + x.rfmScores.r, 0) / snapshots.length).toFixed(2),
      avgF: (snapshots.reduce((s, x) => s + x.rfmScores.f, 0) / snapshots.length).toFixed(2),
      avgM: (snapshots.reduce((s, x) => s + x.rfmScores.m, 0) / snapshots.length).toFixed(2),
    });
};

module.exports = { seedFeatureSnapshots };

// Run standalone: node seeds/06-feature-snapshots.js
if (require.main === module) {
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log("Connected to MongoDB...");
      await seedFeatureSnapshots();
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error seeding feature snapshots:", err);
      process.exit(1);
    });
}
