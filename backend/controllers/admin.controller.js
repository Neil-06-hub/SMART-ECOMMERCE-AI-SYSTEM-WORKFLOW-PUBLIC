const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const MarketingLog = require("../models/MarketingLog");
const Notification = require("../models/Notification");
const BehavioralEvent = require("../models/BehavioralEvent");
const FeatureSnapshot = require("../models/FeatureSnapshot");
const { cloudinary, upload } = require("../config/cloudinary");
const { analyzeBusinessWithAI } = require("../services/gemini.service");
const { triggerMarketingCampaign } = require("../services/marketing.service");
const { createNotification } = require("./notification.controller");

// ===================== DASHBOARD =====================

// @desc  Thống kê tổng quan Dashboard
// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalProducts, totalOrders, allOrders, ctrRaw, rfmRaw] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.find({ orderStatus: { $ne: "cancelled" } }).select("totalAmount createdAt orderStatus"),
      BehavioralEvent.aggregate([
        {
          $match: {
            "metadata.placement": { $exists: true, $ne: null },
            timestamp: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: "$metadata.placement",
            views:  { $sum: { $cond: [{ $eq: ["$eventType", "view"] },      1, 0] } },
            clicks: { $sum: { $cond: [{ $eq: ["$eventType", "rec_click"] }, 1, 0] } },
          },
        },
        {
          $project: {
            placement: "$_id",
            _id: 0,
            ctr: {
              $cond: [
                { $gt: ["$views", 0] },
                { $round: [{ $multiply: [{ $divide: ["$clicks", "$views"] }, 100] }, 1] },
                0,
              ],
            },
          },
        },
        { $sort: { placement: 1 } },
      ]),
      FeatureSnapshot.aggregate([
        { $sort: { userId: 1, snapshotDate: -1 } },
        {
          $group: {
            _id: "$userId",
            r: { $first: "$rfmScores.r" },
            f: { $first: "$rfmScores.f" },
            m: { $first: "$rfmScores.m" },
          },
        },
        {
          $project: {
            segment: {
              $switch: {
                branches: [
                  {
                    case: { $and: [{ $gte: ["$r", 5] }, { $gte: ["$f", 4] }, { $gte: ["$m", 4] }] },
                    then: "Champions",
                  },
                  {
                    case: { $and: [{ $gte: ["$r", 4] }, { $gte: ["$f", 3] }, { $gte: ["$m", 3] }] },
                    then: "Loyal Customers",
                  },
                  {
                    case: { $and: [{ $gte: ["$r", 3] }, { $gte: ["$f", 2] }, { $gte: ["$m", 2] }] },
                    then: "Potential Loyalist",
                  },
                  {
                    case: { $and: [{ $gte: ["$r", 4] }, { $lte: ["$f", 1] }] },
                    then: "New Customers",
                  },
                  {
                    case: { $and: [{ $lte: ["$r", 2] }, { $gte: ["$f", 3] }] },
                    then: "At Risk",
                  },
                ],
                default: "Dormant",
              },
            },
          },
        },
        { $group: { _id: "$segment", users: { $sum: 1 } } },
        { $project: { segment: "$_id", users: 1, _id: 0 } },
        { $sort: { users: -1 } },
      ]),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const thisMonthRevenue = allOrders
      .filter((o) => o.createdAt >= startOfMonth)
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const lastMonthRevenue = allOrders
      .filter((o) => o.createdAt >= startOfLastMonth && o.createdAt <= endOfLastMonth)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Doanh thu theo tháng (12 tháng gần nhất)
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const revenue = allOrders
        .filter((o) => o.createdAt >= start && o.createdAt <= end)
        .reduce((sum, o) => sum + o.totalAmount, 0);
      monthlyRevenue.push({
        month: start.toLocaleDateString("vi-VN", { month: "short", year: "numeric" }),
        revenue,
      });
    }

    // Bug 15 Fix: Tránh chia cho 0 khi tính phần trăm doanh thu
    let revenueGrowth = 0;
    if (lastMonthRevenue === 0) {
      revenueGrowth = thisMonthRevenue > 0 ? 100 : 0;
    } else {
      revenueGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    }

    // Trạng thái đơn hàng
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalProducts, totalOrders, totalRevenue, thisMonthRevenue, lastMonthRevenue, revenueGrowth },
      monthlyRevenue,
      ordersByStatus,
      aiCtrByPlacement: ctrRaw,
      rfmSegments: rfmRaw,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  AI phân tích kinh doanh
// @route GET /api/admin/dashboard/ai-analysis
const getAIAnalysis = async (req, res) => {
  try {
    // Lấy dữ liệu nhanh để truyền cho AI
    const [recentOrders, topProducts] = await Promise.all([
      Order.find({ orderStatus: { $ne: "cancelled" } })
        .sort({ createdAt: -1 })
        .limit(20)
        .select("totalAmount orderStatus createdAt"),
      Product.find({ isActive: true }).sort({ sold: -1 }).limit(5).select("name sold price category"),
    ]);

    const analysis = await analyzeBusinessWithAI({ recentOrders, topProducts });
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== PRODUCT MANAGEMENT =====================

// @desc  Lấy tất cả sản phẩm (admin)
// @route GET /api/admin/products
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, isActive } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;
    if (isActive !== undefined && isActive !== "") filter.isActive = isActive === "true";

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, products, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Tạo sản phẩm mới
// @route POST /api/admin/products
const createProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, tags, stock, featured } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    if (!image) return res.status(400).json({ success: false, message: "Vui lòng tải lên hình ảnh sản phẩm" });

    const product = await Product.create({
      name, description,
      price: Number(price),
      originalPrice: Number(originalPrice) || 0,
      category,
      tags: typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags || [],
      stock: Number(stock),
      image,
      featured: featured === "true" || featured === true,
    });
    // Gửi notification cho users có preferences trùng với tags sản phẩm
    const productTags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags || [];
    if (productTags.length > 0) {
      const interestedUsers = await User.find({ role: "customer", preferences: { $in: productTags } }).select("_id");
      interestedUsers.forEach((u) => {
        createNotification(u._id, {
          type: "new_product",
          title: "Sản phẩm mới phù hợp với bạn! 🛍️",
          message: `"${name}" vừa được thêm vào cửa hàng - có thể bạn sẽ thích!`,
          link: `/products/${product._id}`,
        });
      });
    }

    res.status(201).json({ success: true, message: "Tạo sản phẩm thành công", product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Cập nhật sản phẩm
// @route PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, tags, stock, featured, isActive } = req.body;

    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    const newPrice = Number(price);
    const oldPrice = currentProduct.price;

    const updateData = {
      name, description,
      price: newPrice,
      originalPrice: Number(originalPrice) || 0,
      category,
      tags: typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags || [],
      stock: Number(stock),
      featured: featured === "true" || featured === true,
      isActive: isActive !== false && isActive !== "false",
    };
    if (req.file) updateData.image = req.file.path;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // Gửi thông báo AI khi giảm giá — chỉ 1 lần/sản phẩm/user (dedup theo link)
    if (newPrice < oldPrice) {
      const discountPercent = Math.round((1 - newPrice / oldPrice) * 100);
      const productTags = updateData.tags;
      const interestedUsers = await User.find({
        role: "customer",
        deletedAt: null,
        $or: [{ wishlist: product._id }, { preferences: { $in: productTags } }],
      }).select("_id");

      for (const u of interestedUsers) {
        const alreadyNotified = await Notification.exists({
          user: u._id,
          type: "ai",
          link: `/products/${product._id}`,
        });
        if (alreadyNotified) continue;

        createNotification(u._id, {
          type: "ai",
          title: `Sản phẩm bạn quan tâm đang giảm giá! 🤖`,
          message: `"${product.name}" vừa giảm ${discountPercent}% còn ${new Intl.NumberFormat("vi-VN").format(newPrice)}đ. Đừng bỏ lỡ!`,
          link: `/products/${product._id}`,
        });
      }
    }

    res.json({ success: true, message: "Cập nhật thành công", product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Xóa sản phẩm (soft delete)
// @route DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    res.json({ success: true, message: "Đã ẩn sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== ORDER MANAGEMENT =====================

// @desc  Lấy tất cả đơn hàng
// @route GET /api/admin/orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentMethod, paymentStatus, dateFrom, dateTo } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Cập nhật trạng thái đơn hàng
// @route PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

    // Bug 5 Fix: Validation matrix cho phép transition hợp lệ
    if (orderStatus && orderStatus !== order.orderStatus) {
      const allowedTransitions = {
        "pending": ["confirmed", "cancelled", "paid"],
        "paid": ["confirmed", "cancelled"], 
        "confirmed": ["shipping", "cancelled"],
        "shipping": ["delivered"],
        "delivered": [],
        "cancelled": []
      };
      if (!allowedTransitions[order.orderStatus]?.includes(orderStatus)) {
        return res.status(400).json({ success: false, message: `Không thể chuyển trạng thái từ ${order.orderStatus} sang ${orderStatus}` });
      }

      // Trừ kho khi chuyển sang confirmed
      if (orderStatus === "confirmed") {
        const deducted = [];
        for (const item of order.items) {
          const updated = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity, sold: item.quantity } },
            { new: true }
          );
          if (!updated) {
            // Rollback
            for (const dp of deducted) {
              await Product.findByIdAndUpdate(dp.product, { $inc: { stock: dp.quantity, sold: -dp.quantity } });
            }
            return res.status(400).json({ success: false, message: `Sản phẩm ${item.name} không đủ tồn kho để xác nhận!` });
          }
          deducted.push({ product: item.product, quantity: item.quantity });
        }
      }

      // Hoàn trả kho khi admin hủy đơn đã confirmed (kho đã bị trừ lúc confirm)
      if (orderStatus === "cancelled" && order.orderStatus === "confirmed") {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity, sold: -item.quantity },
          });
        }
      }
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    // Thông báo cho người dùng về trạng thái đơn hàng
    const statusLabels = { pending: "Chờ xác nhận", paid: "Đã thanh toán", confirmed: "Đã xác nhận", shipping: "Đang giao hàng", delivered: "Đã giao hàng", cancelled: "Đã hủy" };
    if (orderStatus && order.user) {
      createNotification(order.user._id, {
        type: "order",
        title: `Đơn hàng cập nhật: ${statusLabels[orderStatus] || orderStatus}`,
        message: `Đơn hàng của bạn đã được cập nhật trạng thái sang "${statusLabels[orderStatus] || orderStatus}".`,
        link: `/orders/${order._id}`,
      });
    }

    res.json({ success: true, message: "Cập nhật trạng thái thành công", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== USER MANAGEMENT =====================

// @desc  Lấy danh sách người dùng
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "customer" }).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Cập nhật thông tin người dùng
// @route PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body; // Bug 18 Fix: Loại bỏ khả năng sửa role tùy tiện
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    res.json({ success: true, message: "Cập nhật thành công", user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Xóa tài khoản người dùng
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    if (user.role === "admin") return res.status(400).json({ success: false, message: "Không thể xóa tài khoản Admin" });
    
    // Bug 9 Fix: Soft delete thay vì Hard delete
    user.deletedAt = new Date();
    user.isBlocked = true;
    await user.save();
    res.json({ success: true, message: "Đã xóa tài khoản người dùng" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Khóa/Mở khóa tài khoản
// @route PATCH /api/admin/users/:id/toggle-block
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    if (user.role === "admin") return res.status(400).json({ success: false, message: "Không thể khóa tài khoản Admin" });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, message: user.isBlocked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản", user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== MARKETING =====================

// @desc  Lấy lịch sử marketing
// @route GET /api/admin/marketing/logs
const getMarketingLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const filter = {};
    if (type) filter.type = type;
    const total = await MarketingLog.countDocuments(filter);
    const logs = await MarketingLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, logs, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Kích hoạt chiến dịch Marketing thủ công
// @route POST /api/admin/marketing/trigger
const triggerMarketing = async (req, res) => {
  try {
    const { campaignType } = req.body;
    const result = await triggerMarketingCampaign(campaignType);

    // Gửi notification promotion cho tất cả khách hàng
    const campaignLabels = { newsletter: "Bản tin tuần mới", abandoned_cart: "Nhắc nhở giỏ hàng", promotion: "Khuyến mãi đặc biệt" };
    const allCustomers = await User.find({ role: "customer" }).select("_id");
    allCustomers.forEach((u) => {
      createNotification(u._id, {
        type: "promotion",
        title: `${campaignLabels[campaignType] || "Thông báo khuyến mãi"} 🎁`,
        message: "Có ưu đãi mới từ SmartShop AI dành cho bạn. Kiểm tra email để biết thêm chi tiết!",
        link: "/shop",
      });
    });

    res.json({ success: true, message: "Chiến dịch đã được kích hoạt", result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardStats, getAIAnalysis,
  getAllProducts, createProduct, updateProduct, deleteProduct,
  getAllOrders, updateOrderStatus,
  getAllUsers, updateUser, deleteUser, toggleBlockUser,
  getMarketingLogs, triggerMarketing,
};
