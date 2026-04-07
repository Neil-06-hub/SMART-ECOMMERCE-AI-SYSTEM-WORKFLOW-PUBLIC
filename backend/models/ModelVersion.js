const mongoose = require("mongoose");

const modelVersionSchema = new mongoose.Schema(
  {
    modelType: {
      type: String,
      enum: ["cf", "cbf"],
      required: true,
    },
    // Version string in YYYY-MM-DD format
    version: {
      type: String,
      required: true,
    },
    metrics: {
      precisionAt10: { type: Number, default: 0 },
      recallAt10: { type: Number, default: 0 },
      ndcgAt10: { type: Number, default: 0 },
    },
    // Cloudflare R2 artifact path, e.g. "models/cf/2026-04-07/cf_model.pkl"
    artifactUrl: { type: String, default: null },
    isActive: { type: Boolean, default: false },
    promotedAt: { type: Date, default: null },
    deprecatedAt: { type: Date, default: null },
    // Training context
    trainingDurationSeconds: { type: Number, default: null },
    trainingSamples: { type: Number, default: null },
  },
  { timestamps: true }
);

// Fast lookup: active model per type
modelVersionSchema.index({ modelType: 1, isActive: 1 });
// History sorted by creation
modelVersionSchema.index({ modelType: 1, createdAt: -1 });

module.exports = mongoose.model("ModelVersion", modelVersionSchema);
