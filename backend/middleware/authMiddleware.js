const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) return res.status(401).json({ success: false, message: "Không có quyền truy cập" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password").where({ deletedAt: null });
    if (!req.user) return res.status(401).json({ success: false, message: "Người dùng không tồn tại" });
    if (req.user.isBlocked) return res.status(403).json({ success: false, message: "Tài khoản của bạn đã bị khóa" });
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Chỉ Admin mới có quyền thực hiện" });
  }
  next();
};

module.exports = { protect, adminOnly };
