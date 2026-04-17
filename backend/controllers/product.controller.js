const Product = require("../models/Product");
const Activity = require("../models/Activity");
const Order = require("../models/Order");
const { getContentBasedRecommendations } = require("../services/recommendation.service");

// @desc  Lấy danh sách sản phẩm (có filter + phân trang)
// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, minPrice, maxPrice, sort } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(Number(minPrice))) filter.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) filter.price.$lte = Number(maxPrice);
      if (Object.keys(filter.price).length === 0) delete filter.price;
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      popular: { sold: -1 },
      rating: { rating: -1 },
    };
    const sortBy = sortOptions[sort] || sortOptions.newest;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Lấy chi tiết sản phẩm + track activity
// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.user", "name avatar");
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    // Ghi lại hành vi xem sản phẩm nếu đã đăng nhập
    if (req.user) {
      await Activity.create({ user: req.user._id, product: product._id, action: "view" });
    }

    // Lấy sản phẩm tương tự (AI Content-based)
    const similar = await getContentBasedRecommendations(product, 4);

    res.json({ success: true, product, similar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Lấy sản phẩm nổi bật / featured
// @route GET /api/products/featured
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, featured: true }).limit(8);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Lấy danh mục sản phẩm
// @route GET /api/products/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Thêm đánh giá sản phẩm
// @route POST /api/products/:id/reviews
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    // Bug 7 Fix: Chỉ người dùng đã mua hàng (và đơn hàng được giao) mới được đánh giá
    const hasBought = await Order.findOne({ 
      user: req.user._id, 
      "items.product": req.params.id, 
      orderStatus: "delivered" 
    });
    if (!hasBought) {
      return res.status(403).json({ success: false, message: "Bạn cần mua sản phẩm này trước khi đánh giá" });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed)
      return res.status(400).json({ success: false, message: "Bạn đã đánh giá sản phẩm này rồi" });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.calculateRating();
    await product.save();

    res.status(201).json({ success: true, message: "Đánh giá thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProducts, getProductById, getFeaturedProducts, getCategories, addReview };
