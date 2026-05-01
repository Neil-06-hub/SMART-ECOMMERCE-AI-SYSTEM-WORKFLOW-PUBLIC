const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const DiscountCode = require("../models/DiscountCode");
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

    // Gửi thông báo khi giảm giá — dedup theo link để tránh spam
    if (newPrice < oldPrice) {
      const discountPercent = Math.round((1 - newPrice / oldPrice) * 100);
      const productLink = `/products/${product._id}`;
      const priceFormatted = new Intl.NumberFormat("vi-VN").format(newPrice);

      const wishlistUsers = await User.find({
        role: "customer", deletedAt: null, wishlist: product._id,
      }).select("_id");

      const prefUsers = await User.find({
        role: "customer", deletedAt: null,
        preferences: { $in: updateData.tags },
        wishlist: { $ne: product._id },
      }).select("_id");

      for (const u of [...wishlistUsers, ...prefUsers]) {
        const alreadyNotified = await Notification.exists({
          user: u._id,
          link: productLink,
          type: { $in: ["wishlist", "promotion", "ai"] },
        });
        if (alreadyNotified) continue;

        const isWishlisted = wishlistUsers.some((w) => w._id.equals(u._id));
        createNotification(u._id, {
          type: isWishlisted ? "wishlist" : "promotion",
          title: isWishlisted
            ? `Sản phẩm yêu thích vừa giảm giá!`
            : `Sản phẩm bạn quan tâm vừa giảm giá`,
          message: `"${product.name}" giảm ${discountPercent}% còn ${priceFormatted}đ.`,
          link: productLink,
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

      // Hoàn trả kho khi admin hủy đơn đã confirmed hoặc shipping (kho đã bị trừ lúc confirm)
      if (orderStatus === "cancelled" && ["confirmed", "shipping"].includes(order.orderStatus)) {
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

    const campaignLabels = { newsletter: "Bản tin tuần mới", abandoned_cart: "Nhắc nhở giỏ hàng", promotion: "Khuyến mãi đặc biệt" };

    // Thông báo chung cho tất cả khách hàng
    const allCustomers = await User.find({ role: "customer" }).select("_id");
    allCustomers.forEach((u) => {
      createNotification(u._id, {
        type: "promotion",
        title: campaignLabels[campaignType] || "Thông báo khuyến mãi",
        message: "Có ưu đãi mới từ SmartShop AI dành cho bạn. Kiểm tra email để biết thêm chi tiết!",
        link: "/shop",
      });
    });

    // Thông báo riêng cho người dùng có sản phẩm đang yêu thích trong chiến dịch
    const featuredProducts = await Product.find({ isActive: true, featured: true })
      .sort({ sold: -1 })
      .limit(5)
      .select("_id name price");

    for (const product of featuredProducts) {
      const wishlistOwners = await User.find({
        role: "customer",
        deletedAt: null,
        wishlist: product._id,
      }).select("_id");

      wishlistOwners.forEach((u) => {
        createNotification(u._id, {
          type: "wishlist",
          title: "Sản phẩm yêu thích có ưu đãi mới!",
          message: `"${product.name}" đang nằm trong chiến dịch ${campaignLabels[campaignType] || "khuyến mãi"}. Xem ngay!`,
          link: `/products/${product._id}`,
        });
      });
    }

    res.json({ success: true, message: "Chiến dịch đã được kích hoạt", result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== ADMIN ALERTS =====================

// @desc  Lấy cảnh báo hệ thống cho admin (tồn kho thấp, đơn pending, mã giảm giá hết hạn)
// @route GET /api/admin/alerts
const getAdminAlerts = async (req, res) => {
  try {
    const now = new Date();

    const [lowStock, pendingOrders, discountAlerts] = await Promise.all([
      Product.find({ isActive: true, stock: { $lt: 10 } })
        .select("name stock image category")
        .sort({ stock: 1 })
        .limit(20),

      Order.find({ orderStatus: "pending", deletedAt: null })
        .populate("user", "name email")
        .select("_id user items totalAmount createdAt orderStatus")
        .sort({ createdAt: -1 })
        .limit(20),

      DiscountCode.find({
        isActive: true,
        $or: [
          { expiresAt: { $ne: null, $lt: now } },
          { $and: [{ usageLimit: { $gt: 0 } }, { $expr: { $gte: ["$usedCount", "$usageLimit"] } }] },
        ],
      })
        .select("code type value usageLimit usedCount expiresAt")
        .limit(20),
    ]);

    res.json({
      success: true,
      data: {
        lowStock,
        pendingOrders,
        discountAlerts,
        total: lowStock.length + pendingOrders.length + discountAlerts.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== WISHLIST STATS =====================

// @desc  Top sản phẩm được yêu thích nhiều nhất (real data từ User.wishlist)
// @route GET /api/admin/dashboard/wishlist-stats
const getWishlistStats = async (req, res) => {
  try {
    const wishlistStats = await User.aggregate([
      { $match: { role: "customer", deletedAt: null } },
      { $unwind: "$wishlist" },
      { $group: { _id: "$wishlist", wishlistCount: { $sum: 1 } } },
      { $sort: { wishlistCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: false } },
      { $match: { "product.isActive": true } },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: "$product.name",
          category: "$product.category",
          price: "$product.price",
          stock: "$product.stock",
          wishlistCount: 1,
        },
      },
    ]);

    res.json({ success: true, wishlistStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== ENHANCED REVENUE =====================

const VIET_EVENTS = [
  { month: 1, day: 1, text: 'Tết DL' },
  { month: 1, day: 29, text: 'Tết Âm Lịch' },
  { month: 2, day: 14, text: 'Valentine' },
  { month: 3, day: 8, text: 'Ngày 8/3' },
  { month: 6, day: 1, text: 'Ngày Thiếu Nhi' },
  { month: 10, day: 20, text: 'Ngày PN 20/10' },
  { month: 11, day: 11, text: 'Sale 11.11' },
  { month: 11, day: 25, text: 'Black Friday' },
  { month: 12, day: 12, text: 'Sale 12.12' },
  { month: 12, day: 25, text: 'Giáng Sinh' },
];

function linearForecast(revenues, numPeriods) {
  const n = revenues.length;
  if (n < 2) return Array.from({ length: numPeriods }, () => revenues[0] || 0);
  const xBar = (n - 1) / 2;
  const yBar = revenues.reduce((s, r) => s + r, 0) / n;
  let sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (i - xBar) * (revenues[i] - yBar);
    sxx += (i - xBar) ** 2;
  }
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = yBar - slope * xBar;
  return Array.from({ length: numPeriods }, (_, k) =>
    Math.max(0, Math.round(intercept + slope * (n + k)))
  );
}

// @desc  Doanh thu với granularity + dự báo AI + so sánh năm trước
// @route GET /api/admin/dashboard/revenue?granularity=month
const getEnhancedRevenue = async (req, res) => {
  try {
    const { granularity = 'month' } = req.query;
    const now = new Date();
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

    const allOrders = await Order.find({
      orderStatus: { $ne: 'cancelled' },
      createdAt: { $gte: twoYearsAgo },
    }).select('totalAmount createdAt');

    const sumOrders = (start, end) =>
      allOrders
        .filter((o) => o.createdAt >= start && o.createdAt < end)
        .reduce((s, o) => s + o.totalAmount, 0);

    let currentPeriods = [];
    let forecastPeriods = [];

    if (granularity === 'day') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
        const label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        currentPeriods.push({ label, revenue: sumOrders(start, end), start, end });
      }
      const fRevs = linearForecast(currentPeriods.map((p) => p.revenue), 7);
      for (let i = 0; i < 7; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1);
        forecastPeriods.push({
          label: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue: fRevs[i],
          isForecast: true,
        });
      }

    } else if (granularity === 'week') {
      const weekDay = now.getDay() === 0 ? 7 : now.getDay();
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weekDay + 1);
      for (let i = 11; i >= 0; i--) {
        const wStart = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() - i * 7);
        const wEnd = new Date(wStart.getFullYear(), wStart.getMonth(), wStart.getDate() + 7);
        const label = wStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        currentPeriods.push({ label, revenue: sumOrders(wStart, wEnd), start: wStart, end: wEnd });
      }
      const fRevs = linearForecast(currentPeriods.map((p) => p.revenue), 4);
      for (let i = 0; i < 4; i++) {
        const wStart = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + (i + 1) * 7);
        const wEnd = new Date(wStart.getFullYear(), wStart.getMonth(), wStart.getDate() + 7);
        forecastPeriods.push({
          label: wStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue: fRevs[i],
          isForecast: true,
        });
      }

    } else if (granularity === 'quarter') {
      const curQ = Math.floor(now.getMonth() / 3);
      const curY = now.getFullYear();
      for (let i = 7; i >= 0; i--) {
        let q = curQ - i; let y = curY;
        while (q < 0) { q += 4; y -= 1; }
        const start = new Date(y, q * 3, 1);
        const end = new Date(y, q * 3 + 3, 1);
        currentPeriods.push({ label: `Q${q + 1}/${y}`, revenue: sumOrders(start, end), start, end, quarter: q });
      }
      const fRevs = linearForecast(currentPeriods.map((p) => p.revenue), 2);
      for (let i = 0; i < 2; i++) {
        let q = curQ + i + 1; let y = curY;
        while (q > 3) { q -= 4; y += 1; }
        forecastPeriods.push({ label: `Q${q + 1}/${y}`, revenue: fRevs[i], isForecast: true });
      }

    } else {
      // month (default): last 12 months
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const label = start.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
        currentPeriods.push({ label, revenue: sumOrders(start, end), start, end });
      }
      const fRevs = linearForecast(currentPeriods.map((p) => p.revenue), 3);
      for (let i = 0; i < 3; i++) {
        const start = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
        forecastPeriods.push({
          label: start.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
          revenue: fRevs[i],
          isForecast: true,
        });
      }
    }

    // Year-over-year comparison
    const comparison = currentPeriods.map((p) => {
      const cStart = new Date(p.start); cStart.setFullYear(cStart.getFullYear() - 1);
      const cEnd = new Date(p.end); cEnd.setFullYear(cEnd.getFullYear() - 1);
      return { label: p.label, revenue: sumOrders(cStart, cEnd) };
    });

    // Vietnamese shopping event annotations
    const annotations = [];
    if (granularity === 'month') {
      for (const period of currentPeriods) {
        const m = period.start.getMonth() + 1;
        const evts = VIET_EVENTS.filter((e) => e.month === m);
        if (evts.length > 0) {
          annotations.push({ label: period.label, text: evts.map((e) => e.text).join(' & ') });
        }
      }
    } else if (granularity === 'quarter') {
      for (const period of currentPeriods) {
        if (period.quarter === 3) annotations.push({ label: period.label, text: 'Mùa Sale' });
        if (period.quarter === 0) annotations.push({ label: period.label, text: 'Tết Nguyên Đán' });
      }
    } else {
      const windowStart = currentPeriods[0]?.start;
      const windowEnd = currentPeriods[currentPeriods.length - 1]?.end;
      if (windowStart && windowEnd) {
        for (const evt of VIET_EVENTS) {
          for (const yr of [now.getFullYear() - 1, now.getFullYear()]) {
            const evtDate = new Date(yr, evt.month - 1, evt.day);
            if (evtDate >= windowStart && evtDate < windowEnd) {
              const bucket = currentPeriods.find((p) => evtDate >= p.start && evtDate < p.end);
              if (bucket) annotations.push({ label: bucket.label, text: evt.text });
            }
          }
        }
      }
    }

    res.json({
      success: true,
      granularity,
      current: currentPeriods.map(({ label, revenue }) => ({ label, revenue })),
      comparison,
      forecast: forecastPeriods,
      annotations,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== INVENTORY TRENDS =====================

// @desc  Sản phẩm sắp hết hàng + từ khóa xu hướng
// @route GET /api/admin/dashboard/inventory-trends
const getInventoryTrends = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [products, purchaseCounts, topViewed, searchQueries] = await Promise.all([
      Product.find({ isActive: true }).select('name category tags stock sold price').lean(),
      BehavioralEvent.aggregate([
        { $match: { eventType: 'purchase', timestamp: { $gte: sevenDaysAgo } } },
        { $group: { _id: '$productId', count: { $sum: 1 } } },
      ]),
      BehavioralEvent.aggregate([
        {
          $match: {
            eventType: { $in: ['view', 'click', 'rec_click'] },
            timestamp: { $gte: thirtyDaysAgo },
          },
        },
        { $group: { _id: '$productId', totalWeight: { $sum: '$weight' } } },
        { $sort: { totalWeight: -1 } },
        { $limit: 30 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
        { $project: { tags: '$product.tags', category: '$product.category', totalWeight: 1 } },
      ]),
      BehavioralEvent.aggregate([
        {
          $match: {
            eventType: 'search',
            timestamp: { $gte: thirtyDaysAgo },
            'metadata.query': { $exists: true, $nin: [null, ''] },
          },
        },
        { $group: { _id: '$metadata.query', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),
    ]);

    // Stockout risk: products selling fast enough to run out within 30 days
    const purchaseMap = {};
    for (const pc of purchaseCounts) purchaseMap[String(pc._id)] = pc.count;

    const stockoutRisk = products
      .map((p) => {
        const purchases7 = purchaseMap[String(p._id)] || 0;
        const dailyVelocity = +(purchases7 / 7).toFixed(2);
        const daysLeft = dailyVelocity > 0 ? Math.floor(p.stock / dailyVelocity) : null;
        return { productId: p._id, name: p.name, category: p.category, stock: p.stock, dailyVelocity, daysLeft };
      })
      .filter((p) => p.daysLeft !== null && p.daysLeft < 30)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 20);

    // Trending keywords from product tags weighted by event activity
    const keywordMap = {};
    for (const item of topViewed) {
      const w = item.totalWeight || 1;
      for (const tag of (item.tags || [])) {
        const t = (tag || '').trim();
        if (t) keywordMap[t] = (keywordMap[t] || 0) + w;
      }
      if (item.category) {
        keywordMap[item.category] = (keywordMap[item.category] || 0) + w * 0.5;
      }
    }
    // Merge actual user search queries (weight ×5 — explicit search intent)
    for (const s of searchQueries) {
      const term = (s._id || '').trim();
      if (term.length >= 2) {
        keywordMap[term] = (keywordMap[term] || 0) + s.count * 5;
      }
    }
    const trendingKeywords = Object.entries(keywordMap)
      .map(([word, weight]) => ({ word, weight: Math.round(weight) }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 40);

    res.json({ success: true, stockoutRisk, trendingKeywords });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardStats, getAIAnalysis,
  getEnhancedRevenue, getInventoryTrends, getWishlistStats,
  getAllProducts, createProduct, updateProduct, deleteProduct,
  getAllOrders, updateOrderStatus,
  getAllUsers, updateUser, deleteUser, toggleBlockUser,
  getMarketingLogs, triggerMarketing,
  getAdminAlerts,
};
