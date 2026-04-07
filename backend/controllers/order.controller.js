const Order = require("../models/Order");
const Product = require("../models/Product");
const Activity = require("../models/Activity");
const User = require("../models/User");
const { createNotification } = require("./notification.controller");

// @desc  Tạo đơn hàng mới
// @route POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, note, discount } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: "Giỏ hàng trống" });

    // Kiểm tra tồn kho và tính tiền
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Sản phẩm ${item.product} không tồn tại` });
      if (product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `${product.name} không đủ hàng` });

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
      subtotal += product.price * item.quantity;
    }

    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const totalAmount = subtotal + shippingFee - (discount || 0);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      discount: discount || 0,
      totalAmount,
      note,
    });

    // Trừ tồn kho và tăng sold
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
      // Ghi activity purchase
      await Activity.create({ user: req.user._id, product: item.product, action: "purchase" });
    }

    // Reset cart abandoned tracking
    await User.findByIdAndUpdate(req.user._id, { cartAbandonedAt: null, cartAbandonedNotified: false });

    // Gửi notification đặt hàng thành công
    createNotification(req.user._id, {
      type: "order",
      title: "Đặt hàng thành công! 🎉",
      message: `Đơn hàng của bạn gồm ${orderItems.length} sản phẩm, tổng ${new Intl.NumberFormat("vi-VN").format(totalAmount)}đ đã được đặt thành công.`,
      link: `/orders/${order._id}`,
    });

    res.status(201).json({ success: true, message: "Đặt hàng thành công", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Lấy đơn hàng của người dùng hiện tại
// @route GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name image");
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Lấy chi tiết 1 đơn hàng
// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Không có quyền xem đơn hàng này" });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Hủy đơn hàng (chỉ khi còn pending)
// @route PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Không có quyền hủy đơn này" });
    if (order.orderStatus !== "pending")
      return res.status(400).json({ success: false, message: "Chỉ có thể hủy đơn hàng đang chờ duyệt" });

    order.orderStatus = "cancelled";
    await order.save();

    // Hoàn trả tồn kho
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } });
    }

    res.json({ success: true, message: "Hủy đơn hàng thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder };
