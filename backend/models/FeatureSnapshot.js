const mongoose = require("mongoose");

const rfmScoreSchema = new mongoose.Schema(
  {
    r: { type: Number, min: 1, max: 5, default: 1 }, // Recency
    f: { type: Number, min: 1, max: 5, default: 1 }, // Frequency
    m: { type: Number, min: 1, max: 5, default: 1 }, // Monetary
  },
  { _id: false }
);

const featureSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    snapshotDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Recent product views (last 20 product IDs)
    recentViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    // Categories the user has purchased from
    purchasedCategories: [{ type: String }],
    // Order-based features
    avgOrderValue: { type: Number, default: 0 },
    purchaseFrequency: { type: Number, default: 0 }, // orders per month
    daysSinceLastPurchase: { type: Number, default: 999 },
    totalOrderCount: { type: Number, default: 0 },
    // RFM scores (1-5 each)
    rfmScores: { type: rfmScoreSchema, default: () => ({}) },
    // Category interaction counts for CBF
    categoryInteractions: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Index: latest snapshot per user
featureSnapshotSchema.index({ userId: 1, snapshotDate: -1 });

// Unique compound: one snapshot per user per day
featureSnapshotSchema.index(
  { userId: 1, snapshotDate: 1 },
  { unique: false }
);

module.exports = mongoose.model("FeatureSnapshot", featureSnapshotSchema);
