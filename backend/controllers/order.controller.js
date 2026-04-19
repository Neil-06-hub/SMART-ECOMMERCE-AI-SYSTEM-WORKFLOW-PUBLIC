const Order = require("../models/Order");
const Product = require("../models/Product");
const Activity = require("../models/Activity");
const User = require("../models/User");
const DiscountCode = require("../models/DiscountCode");
const { createNotification } = require("./notification.controller");

// @desc  Tạo đơn hàng mới
// @route POST /api/orders
const createOrder = async (req, res) => {
  // Bug 10 Fix: Biến ngoài try để catch block có thể rollback discount nếu order thất bại
  let discountReserved = false;
  let discountCodeNormalized = null;
  let reservedDiscount = null;

  try {
    const { items, shippingAddress, paymentMethod, note, discount, discountCode } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: "Giỏ hàng trống" });

    let subtotal = 0;
    const orderItems = [];

    // Bug 10 Fix: Atomic reserve — check + increment trong 1 DB operation để tránh race condition
    // findOneAndUpdate trả về null nếu filter không match → reject ngay, không thể vượt usageLimit
    if (discountCode) {
      discountCodeNormalized = discountCode.toUpperCase().trim();
      reservedDiscount = await DiscountCode.findOneAndUpdate(
        {
          code: discountCodeNormalized,
          isActive: true,
          $and: [
            { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
            { $or: [{ usageLimit: 0 }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }] },
          ],
        },
        { $inc: { usedCount: 1 } },
        { new: false }
      );
      if (!reservedDiscount) {
        return res.status(400).json({ success: false, message: "Mã giảm giá không hợp lệ, đã hết hạn hoặc hết lượt sử dụng" });
      }
      discountReserved = true;
    }

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        // Rollback discount reservation trước khi return lỗi
        if (discountReserved) {
          await DiscountCode.findOneAndUpdate({ code: discountCodeNormalized }, { $inc: { usedCount: -1 } });
          discountReserved = false;
        }
        return res.status(404).json({ success: false, message: `Sản phẩm ${item.product} không tồn tại` });
      }

      // Bug 3 & 4 Fix: Chỉ kiểm tra, không trừ kho tại lúc khởi tạo (sẽ trừ khi admin confirm để tránh kẹt kho)
      if (product.stock < item.quantity) {
        if (discountReserved) {
          await DiscountCode.findOneAndUpdate({ code: discountCodeNormalized }, { $inc: { usedCount: -1 } });
          discountReserved = false;
        }
        return res.status(400).json({ success: false, message: `${product.name} không đủ hàng (còn ${product.stock})` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
      subtotal += product.price * item.quantity;
    }

    // Tính lại discount server-side — không tin giá trị discount từ frontend
    let serverDiscount = 0;
    if (discountReserved && reservedDiscount) {
      if (reservedDiscount.minOrderAmount > 0 && subtotal < reservedDiscount.minOrderAmount) {
        await DiscountCode.findOneAndUpdate({ code: discountCodeNormalized }, { $inc: { usedCount: -1 } });
        discountReserved = false;
        return res.status(400).json({
          success: false,
          message: `Đơn hàng tối thiểu ${new Intl.NumberFormat("vi-VN").format(reservedDiscount.minOrderAmount)}đ để dùng mã này`,
        });
      }
      if (reservedDiscount.type === "percent") {
        serverDiscount = Math.round(subtotal * (reservedDiscount.value / 100));
        if (reservedDiscount.maxDiscount > 0) serverDiscount = Math.min(serverDiscount, reservedDiscount.maxDiscount);
      } else {
        serverDiscount = reservedDiscount.value;
      }
    }

    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const totalAmount = Math.max(0, subtotal + shippingFee - serverDiscount);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      discount: serverDiscount,
      discountCode: discountCode || null,
      totalAmount,
      note,
    });

    // Ghi activity purchase
    for (const item of orderItems) {
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
    // Rollback discount nếu order creation ném exception sau khi đã reserve
    if (discountReserved && discountCodeNormalized) {
      await DiscountCode.findOneAndUpdate(
        { code: discountCodeNormalized },
        { $inc: { usedCount: -1 } }
      ).catch(() => {});
    }
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
    if (!["pending", "paid"].includes(order.orderStatus))
      return res.status(400).json({ success: false, message: "Chỉ có thể hủy đơn hàng đang chờ xác nhận hoặc đang chờ thanh toán" });

    order.orderStatus = "cancelled";
    await order.save();

    createNotification(req.user._id, {
      type: "order",
      title: "Đơn hàng đã được hủy",
      message: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()} của bạn đã được hủy thành công.`,
      link: `/orders/${order._id}`,
    });

    // Hoàn trả lượt dùng mã giảm giá nếu có
    if (order.discountCode) {
      await DiscountCode.findOneAndUpdate(
        { code: order.discountCode.toUpperCase().trim(), usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } }
      );
    }

    res.json({ success: true, message: "Hủy đơn hàng thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder };
