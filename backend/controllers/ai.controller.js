const Activity = require("../models/Activity");
const Product = require("../models/Product");
const User = require("../models/User");
const { getCollaborativeRecommendations } = require("../services/recommendation.service");

// @desc  Lấy gợi ý sản phẩm cá nhân hóa cho user (Home page)
// @route GET /api/ai/recommendations
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Gọi FastAPI thay vì tính toán nội bộ
    const fastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
    
    // Yêu cầu gợi ý
    const response = await fetch(`${fastApiUrl}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId.toString(),
        placement: "homepage",
        n: 8
      })
    });

    if (!response.ok) {
      throw new Error(`FastAPI responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Lấy thông tin chi tiết sản phẩm từ MongoDB dựa trên ID trả về từ FastAPI
    const products = await Product.find({ _id: { $in: data.productIds } });
    
    res.json({ 
      success: true, 
      products: products, 
      type: "personalized_ai", 
      message: "Gợi ý thông minh từ AI Model",
      version: data.model_version
    });
  } catch (err) {
    console.error("FastAPI Error:", err);
    // Fallback: Nếu FastAPI lỗi, trả về sản phẩm nổi bật
    const products = await Product.find({ isActive: true, featured: true }).limit(8);
    res.json({ success: true, products, type: "featured_fallback", message: "Phát hiện lỗi AI, hiển thị SP nổi bật" });
  }
};

// @desc  Track hoạt động thêm vào giỏ hàng
// @route POST /api/ai/track
const trackActivity = async (req, res) => {
  try {
    const { productId, action } = req.body;
    await Activity.create({ user: req.user._id, product: productId, action });

    // Nếu thêm vào giỏ -> cập nhật cartAbandonedAt để trigger marketing sau 24h
    if (action === "add_cart") {
      await User.findByIdAndUpdate(req.user._id, {
        cartAbandonedAt: new Date(),
        cartAbandonedNotified: false,
      });
    }
    if (action === "purchase" || action === "remove_cart") {
      await User.findByIdAndUpdate(req.user._id, {
        cartAbandonedAt: null,
        cartAbandonedNotified: false,
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPersonalizedRecommendations, trackActivity };
