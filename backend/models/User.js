const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { 
      type: String, 
      required: true, 
      validate: {
        validator: function(v) {
          // Chỉ validate regex nếu đây là chuỗi thường chưa hash (chưa có $2a$ hay $2b$)
          if (v && v.startsWith('$2')) return true; 
          return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
        },
        message: "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt"
      }
    },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    addresses: [
      {
        fullName: { type: String },
        phone: { type: String },
        street: { type: String },
        city: { type: String },
        isDefault: { type: Boolean, default: false }
      }
    ],
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
    // Soft delete
    deletedAt: { type: Date, default: null },
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
