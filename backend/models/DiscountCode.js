const mongoose = require("mongoose");

const discountCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },  // Giảm tối đa (chỉ cho percent)
    usageLimit: { type: Number, default: 0 },       // 0 = không giới hạn
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiscountCode", discountCodeSchema);
