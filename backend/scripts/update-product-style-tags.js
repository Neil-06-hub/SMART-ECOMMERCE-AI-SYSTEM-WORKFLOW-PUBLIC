/**
 * One-time migration: adds style/color tags to existing products in MongoDB.
 * Run: node backend/scripts/update-product-style-tags.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: require("path").join(__dirname, "../.env") });

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/smart-ecommerce";

// style/color tags to add, keyed by partial product name match
const STYLE_TAG_MAP = [
  // Smartphones
  { match: "AI Pro 15",           add: ["casual", "streetwear", "đen"] },
  { match: "Samsung Galaxy S24",  add: ["formal", "casual"] },
  { match: "iPhone 15",           add: ["tối giản", "formal", "bạc"] },
  { match: "Xiaomi 14",           add: ["casual"] },
  { match: "OPPO Find X7",        add: ["casual"] },
  { match: "Google Pixel 8",      add: ["tối giản", "casual"] },
  { match: "Vivo X100",           add: ["casual"] },
  { match: "OnePlus 12",          add: ["casual", "streetwear"] },
  { match: "Realme GT",           add: ["streetwear", "đen"] },
  // Laptops
  { match: "Creator X1",          add: ["tối giản", "formal"] },
  { match: "MacBook Air",         add: ["tối giản", "bạc"] },
  { match: "Dell XPS",            add: ["tối giản", "formal", "bạc"] },
  { match: "ROG Zephyrus",        add: ["streetwear", "đen"] },
  { match: "ThinkPad X1",         add: ["formal", "đen"] },
  { match: "HP Spectre",          add: ["formal", "tối giản", "bạc"] },
  { match: "MSI Titan",           add: ["streetwear", "đen"] },
  { match: "Acer Swift",          add: ["tối giản", "casual"] },
  { match: "Vivobook",            add: ["casual"] },
  // Monitors
  { match: "UltraWide 34",        add: ["formal", "streetwear"] },
  { match: "LG 27",               add: ["streetwear", "đen"] },
  { match: "Samsung Odyssey",     add: ["streetwear", "đen"] },
  { match: "ProArt PA279",        add: ["tối giản", "formal"] },
  { match: "Dell 27",             add: ["streetwear", "đen"] },
  // Cameras
  { match: "Mirrorless Alpha",    add: ["tối giản", "bạc"] },
  { match: "Canon EOS R6",        add: ["formal", "bạc"] },
  { match: "Fujifilm X-T5",       add: ["vintage", "bạc"] },
  { match: "GoPro Hero",          add: ["casual", "streetwear", "đen"] },
  { match: "DJI Osmo",            add: ["tối giản", "casual"] },
  { match: "Sony ZV-E10",         add: ["casual"] },
  // Audio
  { match: "AI Silence",          add: ["tối giản", "casual", "đen"] },
  { match: "Sony WH-1000",        add: ["tối giản", "casual", "đen"] },
  { match: "AirPods Pro",         add: ["tối giản", "casual", "trắng"] },
  { match: "Bose QuietComfort",   add: ["formal", "tối giản", "đen"] },
  { match: "JBL Charge",          add: ["casual", "streetwear"] },
  { match: "Sennheiser",          add: ["formal", "tối giản", "đen"] },
  { match: "Sonos Era",           add: ["tối giản", "formal", "trắng"] },
  // Watches
  { match: "Fit AI Watch",        add: ["casual", "streetwear", "đen"] },
  { match: "Apple Watch",         add: ["casual", "formal", "bạc"] },
  { match: "Samsung Galaxy Watch",add: ["casual", "đen"] },
  { match: "Garmin Fenix",        add: ["casual", "streetwear", "bạc"] },
  { match: "Amazfit GTR",         add: ["casual", "streetwear", "đen"] },
  { match: "Huawei Watch",        add: ["casual", "formal"] },
  // Accessories
  { match: "Ergonomic AI",        add: ["tối giản", "formal"] },
  { match: "AI Master",           add: ["streetwear", "đen"] },
  { match: "Logitech MX Master",  add: ["tối giản", "formal", "đen"] },
  { match: "iPad Pro",            add: ["tối giản", "formal", "bạc"] },
  { match: "StreamCam",           add: ["casual"] },
  { match: "Anker",               add: ["tối giản", "formal"] },
  { match: "Keychron K8",         add: ["tối giản", "streetwear", "đen"] },
  { match: "HyperX Cloud Alpha",  add: ["streetwear", "đen"] },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB...");

  const db = mongoose.connection.db;
  const products = db.collection("products");

  let updated = 0;
  for (const { match, add } of STYLE_TAG_MAP) {
    const result = await products.updateMany(
      { name: { $regex: match, $options: "i" } },
      { $addToSet: { tags: { $each: add } } }
    );
    if (result.modifiedCount > 0) {
      console.log(`  ✅ "${match}" → added [${add.join(", ")}] (${result.modifiedCount} doc)`);
      updated += result.modifiedCount;
    }
  }

  console.log(`\nDone. Total documents updated: ${updated}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
