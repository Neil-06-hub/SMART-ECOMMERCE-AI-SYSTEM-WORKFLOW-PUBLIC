const Notification = require("../models/Notification");

// Helper: tạo notification (dùng trong các controller khác)
const createNotification = async (userId, { type, title, message, link = "" }) => {
  try {
    await Notification.create({ user: userId, type, title, message, link });
  } catch (err) {
    console.error("Notification create error:", err.message);
  }
};

// @desc  Lấy thông báo của người dùng (20 mới nhất)
// @route GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Đánh dấu tất cả đã đọc
// @route PUT /api/notifications/read-all
const readAllNotifications = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: "Đã đánh dấu tất cả là đã đọc" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Đánh dấu 1 thông báo đã đọc
// @route PUT /api/notifications/:id/read
const readOneNotification = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Xóa 1 thông báo
// @route DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: "Đã xóa thông báo" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createNotification, getNotifications, readAllNotifications, readOneNotification, deleteNotification };
