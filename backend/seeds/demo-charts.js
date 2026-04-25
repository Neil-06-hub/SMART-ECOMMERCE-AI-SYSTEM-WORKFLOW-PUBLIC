/**
 * Demo seed — inserts fake data for the two admin dashboard charts:
 *   1. AI CTR by placement (BehavioralEvent)
 *   2. RFM customer segments (FeatureSnapshot)
 *
 * Safe to run without touching existing data.
 * Run: node seeds/demo-charts.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const BehavioralEvent = require("../models/BehavioralEvent");
const FeatureSnapshot = require("../models/FeatureSnapshot");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/smart-ecommerce";

function rndDate(daysAgo) {
  return new Date(Date.now() - Math.floor(Math.random() * daysAgo * 24 * 60 * 60 * 1000));
}

function fakeId() {
  return new mongoose.Types.ObjectId();
}

// ─── 1. AI CTR events ────────────────────────────────────────────────────────
// Target CTR per placement:
//   homepage  → ~8%   (150 view, 12 rec_click)
//   pdp       → ~13%  (80 view,  10 rec_click)
//   cart      → ~6%   (50 view,   3 rec_click)
//   search    → ~4%   (100 view,  4 rec_click)

function makeCtrEvents() {
  const placements = [
    { name: "homepage", views: 150, clicks: 12 },
    { name: "pdp",      views: 80,  clicks: 10 },
    { name: "cart",     views: 50,  clicks: 3  },
    { name: "search",   views: 100, clicks: 4  },
  ];

  const events = [];
  const dummyProduct = fakeId();
  const dummyUser    = fakeId();

  for (const p of placements) {
    for (let i = 0; i < p.views; i++) {
      events.push({
        userId: dummyUser,
        productId: dummyProduct,
        eventType: "view",
        weight: 1,
        timestamp: rndDate(25),          // within last 25 days → passes 30-day filter
        metadata: { placement: p.name },
      });
    }
    for (let i = 0; i < p.clicks; i++) {
      events.push({
        userId: dummyUser,
        productId: dummyProduct,
        eventType: "rec_click",
        weight: 1.5,
        timestamp: rndDate(25),
        metadata: { placement: p.name },
      });
    }
  }
  return events;
}

// ─── 2. RFM snapshots ────────────────────────────────────────────────────────
// Distribution:  Champions 3 | Loyal 5 | Potential 8 | New 4 | At Risk 6 | Dormant 10

const RFM_GROUPS = [
  { segment: "Champions",          count: 3,  r: 5, f: 5, m: 5 },
  { segment: "Loyal Customers",    count: 5,  r: 4, f: 4, m: 4 },
  { segment: "Potential Loyalist", count: 8,  r: 3, f: 3, m: 3 },
  { segment: "New Customers",      count: 4,  r: 5, f: 1, m: 1 },
  { segment: "At Risk",            count: 6,  r: 2, f: 4, m: 4 },
  { segment: "Dormant",            count: 10, r: 1, f: 1, m: 1 },
];

function makeRfmSnapshots() {
  const snapshots = [];
  const today = new Date();

  for (const g of RFM_GROUPS) {
    for (let i = 0; i < g.count; i++) {
      snapshots.push({
        userId: fakeId(),
        snapshotDate: today,
        avgOrderValue: g.m * 1_000_000,
        purchaseFrequency: g.f * 0.8,
        daysSinceLastPurchase: (6 - g.r) * 40,
        totalOrderCount: g.f * 3,
        rfmScores: { r: g.r, f: g.f, m: g.m },
        recentViews: [],
        categoryInteractions: {},
        purchasedCategories: [],
      });
    }
  }
  return snapshots;
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const ctrEvents = makeCtrEvents();
  await BehavioralEvent.insertMany(ctrEvents);
  console.log(`✓ Inserted ${ctrEvents.length} BehavioralEvent records (CTR chart)`);

  const rfmSnaps = makeRfmSnapshots();
  await FeatureSnapshot.insertMany(rfmSnaps);
  console.log(`✓ Inserted ${rfmSnaps.length} FeatureSnapshot records (RFM chart)`);

  console.log("\nDone! Refresh /admin/dashboard to see the charts.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
