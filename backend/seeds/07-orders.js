/**
 * Seed 07 — Order History (12 months)
 * Tạo ~200 đơn hàng trải dài 12 tháng gần nhất
 * Dùng cho: Admin Dashboard (doanh thu, trạng thái đơn hàng)
 *
 * Export: seedOrders()
 * Standalone: node seeds/07-orders.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/smart-ecommerce";

// Số đơn theo tháng (index 0 = 11 tháng trước, index 11 = tháng này)
// Tạo xu hướng tăng trưởng tự nhiên với 1 tháng drop giữa chừng
const ORDERS_PER_MONTH = [8, 10, 12, 9, 14, 17, 15, 20, 22, 25, 18, 28];

const ADDRESSES = [
  { fullName: "Nguyễn Văn A", phone: "0901234567", address: "123 Lê Lợi, P.Bến Nghé", city: "TP. Hồ Chí Minh" },
  { fullName: "Trần Thị Bình", phone: "0912345678", address: "456 Trần Phú, P.Hải Châu", city: "Đà Nẵng" },
  { fullName: "Lê Minh Cường", phone: "0923456789", address: "789 Đinh Tiên Hoàng, P.Bạch Đằng", city: "Hà Nội" },
  { fullName: "Phạm Thu Dung", phone: "0934567890", address: "321 Nguyễn Huệ, P.Bến Nghé", city: "TP. Hồ Chí Minh" },
  { fullName: "Hoàng Văn Em", phone: "0945678901", address: "654 Hai Bà Trưng, P.Tân Định", city: "TP. Hồ Chí Minh" },
  { fullName: "Vũ Thị Flan", phone: "0956789012", address: "987 Phan Châu Trinh, Q.Hải Châu", city: "Đà Nẵng" },
  { fullName: "Đặng Quốc Giang", phone: "0967890123", address: "147 Lý Thường Kiệt, Q.Hoàn Kiếm", city: "Hà Nội" },
  { fullName: "Bùi Thị Hoa", phone: "0978901234", address: "258 Võ Thị Sáu, Q.3", city: "TP. Hồ Chí Minh" },
];

const PAYMENT_METHODS = ["COD", "banking", "momo"];
const PAYMENT_WEIGHTS = [0.45, 0.35, 0.20]; // COD 45%, banking 35%, momo 20%

/**
 * Chọn phần tử random có trọng số
 */
function weightedRandom(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Tính orderStatus dựa vào tuổi của đơn:
 * - Đơn > 30 ngày: mostly delivered (85%), một ít cancelled (15%)
 * - Đơn 14-30 ngày: delivered (60%), shipping (25%), confirmed (10%), cancelled (5%)
 * - Đơn 7-14 ngày: shipping (50%), confirmed (30%), delivered (15%), cancelled (5%)
 * - Đơn < 7 ngày: pending (40%), confirmed (35%), shipping (20%), delivered (5%)
 */
function getStatusForAge(daysAgo) {
  const r = Math.random();
  if (daysAgo > 30) {
    return r < 0.85 ? "delivered" : "cancelled";
  }
  if (daysAgo > 14) {
    if (r < 0.60) return "delivered";
    if (r < 0.85) return "shipping";
    if (r < 0.95) return "confirmed";
    return "cancelled";
  }
  if (daysAgo > 7) {
    if (r < 0.50) return "shipping";
    if (r < 0.80) return "confirmed";
    if (r < 0.95) return "delivered";
    return "cancelled";
  }
  // < 7 ngày
  if (r < 0.40) return "pending";
  if (r < 0.75) return "confirmed";
  if (r < 0.95) return "shipping";
  return "delivered";
}

/**
 * Lấy ngày random trong một tháng cụ thể
 * monthsAgo: 0 = tháng này, 11 = 11 tháng trước
 */
function randomDateInMonth(monthsAgo) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() - monthsAgo;

  const start = new Date(year, month, 1, 0, 0, 0);
  const end = monthsAgo === 0
    ? now  // tháng hiện tại: đến hôm nay
    : new Date(year, month + 1, 0, 23, 59, 59); // tháng cũ: đến cuối tháng

  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const seedOrders = async () => {
  // Lấy users và products từ DB
  const customers = await User.find({ role: "customer" }).select("_id name email");
  const products = await Product.find({ isActive: true }).select("_id name image price");

  if (customers.length === 0) {
    console.log("  ⚠️  Không tìm thấy customer nào. Hãy chạy seed users trước.");
    return;
  }
  if (products.length === 0) {
    console.log("  ⚠️  Không tìm thấy sản phẩm nào. Hãy chạy seed products trước.");
    return;
  }

  // Xóa đơn hàng cũ
  await Order.deleteMany({});

  const orders = [];
  const now = new Date();

  for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
    const count = ORDERS_PER_MONTH[11 - monthsAgo];

    for (let i = 0; i < count; i++) {
      const orderDate = randomDateInMonth(monthsAgo);
      const daysAgo = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

      // Random customer
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const address = ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)];

      // Random 1-3 sản phẩm
      const numItems = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      const selectedProducts = shuffled.slice(0, numItems);

      const items = selectedProducts.map((p) => ({
        product: p._id,
        name: p.name,
        image: p.image,
        price: p.price,
        quantity: Math.floor(Math.random() * 2) + 1, // 1-2 cái
      }));

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shippingFee = subtotal >= 5000000 ? 0 : 30000; // Miễn ship cho đơn >= 5tr
      const discount = Math.random() < 0.15 ? Math.round(subtotal * 0.1 / 1000) * 1000 : 0; // 15% đơn có discount 10%
      const totalAmount = subtotal + shippingFee - discount;

      const paymentMethod = weightedRandom(PAYMENT_METHODS, PAYMENT_WEIGHTS);
      const orderStatus = getStatusForAge(daysAgo);
      const paymentStatus =
        orderStatus === "delivered" ? "paid" :
        paymentMethod !== "COD" && orderStatus !== "cancelled" ? "paid" :
        orderStatus === "cancelled" ? "failed" : "pending";

      orders.push({
        user: customer._id,
        items,
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          address: address.address,
          city: address.city,
        },
        paymentMethod,
        paymentStatus,
        orderStatus,
        subtotal,
        shippingFee,
        discount,
        totalAmount,
        note: "",
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }
  }

  // Insert tất cả với timestamps thực tế
  await Order.insertMany(orders, { timestamps: false });

  // Tóm tắt
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== "cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  console.log(`  ✅ ${orders.length} đơn hàng đã được tạo`);
  console.log(`  💰 Tổng doanh thu (không tính hủy): ${totalRevenue.toLocaleString("vi-VN")}đ`);

  const statusCount = {};
  orders.forEach((o) => { statusCount[o.orderStatus] = (statusCount[o.orderStatus] || 0) + 1; });
  Object.entries(statusCount).forEach(([s, c]) => console.log(`     ${s}: ${c} đơn`));
};

// Chạy standalone
if (require.main === module) {
  const mongoose = require("mongoose");
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log("🌱 Seeding orders...");
      await seedOrders();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedOrders };
