const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    dob: { type: Date, default: null },
    gender: { type: String, enum: ["Nam", "Nữ", "Khác", ""], default: "" },
    // Tags sở thích dùng cho AI Recommendation
    preferences: [{ type: String }],
    // Danh sách sản phẩm yêu thích
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    // Khóa tài khoản
    isBlocked: { type: Boolean, default: false },
    // Theo dõi trạng thái cart bỏ quên để trigger Marketing
    cartAbandonedAt: { type: Date, default: null },
    cartAbandonedNotified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// So sánh password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
