const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
require("dotenv").config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB!");

  const orders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email");
  console.log("Last 5 orders:");
  orders.forEach(o => {
    console.log({
      _id: o._id.toString(),
      code: o._id.toString().slice(-8).toUpperCase(),
      user: o.user ? o.user.name : "null",
      userId: o.user ? o.user._id.toString() : "null",
      orderStatus: o.orderStatus,
      paymentMethod: o.paymentMethod,
      totalAmount: o.totalAmount,
    });
  });

  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
