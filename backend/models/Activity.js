const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    action: {
      type: String,
      enum: ["view", "add_cart", "purchase", "remove_cart"],
      required: true,
    },
  },
  { timestamps: true }
);

// Index để query nhanh theo user
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ product: 1, action: 1 });

module.exports = mongoose.model("Activity", activitySchema);
