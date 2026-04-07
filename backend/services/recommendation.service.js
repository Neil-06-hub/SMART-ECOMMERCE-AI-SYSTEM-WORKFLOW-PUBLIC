const Product = require("../models/Product");
const Activity = require("../models/Activity");

/**
 * Content-based Filtering: Gợi ý sản phẩm tương tự dựa trên tags
 * Dùng cho trang chi tiết sản phẩm
 * @param {Object} product - Sản phẩm đang xem
 * @param {number} limit - Số sản phẩm gợi ý
 */
const getContentBasedRecommendations = async (product, limit = 4) => {
  try {
    if (!product.tags || product.tags.length === 0) {
      // Fallback: cùng category
      return Product.find({
        _id: { $ne: product._id },
        category: product.category,
        isActive: true,
      }).limit(limit);
    }

    // Tìm sản phẩm có nhiều tags trùng nhất
    const similar = await Product.aggregate([
      {
        $match: {
          _id: { $ne: product._id },
          isActive: true,
        },
      },
      {
        $addFields: {
          commonTags: {
            $size: {
              $ifNull: [
                { $setIntersection: ["$tags", product.tags] },
                [],
              ],
            },
          },
        },
      },
      { $sort: { commonTags: -1, rating: -1 } },
      { $limit: limit },
    ]);

    return similar;
  } catch (err) {
    console.error("Content-based recommendation error:", err);
    return [];
  }
};

/**
 * Collaborative Filtering (giả lập): Gợi ý dựa trên hành vi người dùng tương tự
 * Dùng cho trang Home
 * @param {string} userId
 * @param {Array} userActivities - Lịch sử hoạt động của user
 */
const getCollaborativeRecommendations = async (userId, userActivities) => {
  try {
    // Lấy tags từ sản phẩm user đã xem/mua
    const viewedProductIds = userActivities.map((a) => a.product?._id || a.product);
    const viewedTags = [...new Set(userActivities.flatMap((a) => a.product?.tags || []))];
    const viewedCategories = [...new Set(userActivities.map((a) => a.product?.category).filter(Boolean))];

    if (viewedTags.length === 0 && viewedCategories.length === 0) {
      return Product.find({ isActive: true, featured: true }).limit(8);
    }

    // Tìm sản phẩm chưa xem, ưu tiên theo tags và categories của user
    const recommendations = await Product.aggregate([
      {
        $match: {
          _id: { $nin: viewedProductIds },
          isActive: true,
        },
      },
      {
        $addFields: {
          tagScore: {
            $size: { $ifNull: [{ $setIntersection: ["$tags", viewedTags] }, []] },
          },
          categoryMatch: {
            $cond: [{ $in: ["$category", viewedCategories] }, 2, 0],
          },
        },
      },
      {
        $addFields: {
          relevanceScore: { $add: ["$tagScore", "$categoryMatch", { $multiply: ["$rating", 0.5] }] },
        },
      },
      { $sort: { relevanceScore: -1, sold: -1 } },
      { $limit: 8 },
    ]);

    return recommendations;
  } catch (err) {
    console.error("Collaborative recommendation error:", err);
    return Product.find({ isActive: true }).sort({ sold: -1 }).limit(8);
  }
};

module.exports = { getContentBasedRecommendations, getCollaborativeRecommendations };
