const mongoose = require("mongoose");

const marketingLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["welcome", "cart_abandoned", "newsletter", "promotion"],
      required: true,
    },
    recipient: { type: String, required: true }, // email người nhận
    recipientName: { type: String, default: "" },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ["success", "failed", "pending"], default: "pending" },
    errorMessage: { type: String, default: "" },
    // Metadata AI tạo ra
    aiGenerated: { type: Boolean, default: true },
    discountCode: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketingLog", marketingLogSchema);
