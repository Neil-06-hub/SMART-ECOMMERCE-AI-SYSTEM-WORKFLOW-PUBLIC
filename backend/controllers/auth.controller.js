const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../services/marketing.service");
const { createNotification } = require("./notification.controller");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

// @desc  Đăng ký tài khoản
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, message: "Email đã được sử dụng" });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    // Gửi email chào mừng (không block response)
    sendWelcomeEmail(user).catch(console.error);

    // Thông báo chào mừng
    createNotification(user._id, {
      type: "system",
      title: "Chào mừng đến với SmartShop AI! 👋",
      message: `Xin chào ${user.name}! Tài khoản của bạn đã được tạo thành công. Khám phá cửa hàng và nhận gợi ý sản phẩm từ AI ngay hôm nay.`,
      link: "/shop",
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, dob: user.dob, gender: user.gender },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Đăng nhập
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu" });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, dob: user.dob, gender: user.gender },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Lấy thông tin cá nhân
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc  Cập nhật thông tin cá nhân
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, preferences, avatar, dob, gender } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, preferences, avatar, dob, gender },
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Đổi mật khẩu
// @route PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: "Mật khẩu hiện tại không đúng" });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
