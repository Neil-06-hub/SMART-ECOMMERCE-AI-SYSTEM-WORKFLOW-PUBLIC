const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const DiscountCode = require("../models/DiscountCode");
const { createNotification } = require("../controllers/notification.controller");
require("dotenv").config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB!");

  const orderId = "6a266a5f542a36215a964bd8";
  const userId = "6a2663dd4afaed99002c207a";

  const order = await Order.findById(orderId);
  if (!order) {
    console.log("Order not found");
    process.exit(1);
  }

  console.log("Found order:", {
    _id: order._id,
    user: order.user,
    orderStatus: order.orderStatus,
  });

  // Verify user
  if (order.user.toString() !== userId) {
    console.log("Forbidden: user does not match");
    process.exit(1);
  }

  // Check orderStatus
  if (!["pending", "paid"].includes(order.orderStatus)) {
    console.log("Bad Request: invalid status for cancellation");
    process.exit(1);
  }

  try {
    order.orderStatus = "cancelled";
    await order.save();
    console.log("Saved order status to cancelled!");

    await createNotification(userId, {
      type: "order",
      title: "Đơn hàng đã được hủy",
      message: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()} của bạn đã được hủy thành công.`,
      link: `/orders/${order._id}`,
    });
    console.log("Notification created!");

    if (order.discountCode) {
      await DiscountCode.findOneAndUpdate(
        { code: order.discountCode.toUpperCase().trim(), usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } }
      );
      console.log("Discount refunded!");
    }
  } catch (err) {
    console.error("Save/Notification error:", err);
  }

  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
