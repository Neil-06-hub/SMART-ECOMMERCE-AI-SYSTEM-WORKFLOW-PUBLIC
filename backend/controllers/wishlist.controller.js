const User = require("../models/User");

// @desc  Lấy danh sách sản phẩm yêu thích
// @route GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("wishlist")
      .populate("wishlist", "name price originalPrice image category rating numReviews stock isActive");

    const activeItems = (user.wishlist || []).filter((p) => p && p.isActive !== false);
    res.json({ success: true, wishlist: activeItems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle thêm/xóa sản phẩm vào wishlist
// @route POST /api/wishlist/:productId
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id).select("wishlist");

    const alreadyAdded = user.wishlist.some((id) => id.toString() === productId);

    if (alreadyAdded) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json({ success: true, added: !alreadyAdded, wishlistIds: user.wishlist.map((id) => id.toString()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Xóa sản phẩm khỏi wishlist
// @route DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: productId } });
    res.json({ success: true, message: "Đã xóa khỏi danh sách yêu thích" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Lấy danh sách ID wishlist (dùng để đồng bộ store)
// @route GET /api/wishlist/ids
const getWishlistIds = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("wishlist")
      .populate("wishlist", "_id isActive");
    const activeIds = (user.wishlist || [])
      .filter((p) => p && p.isActive !== false)
      .map((p) => p._id.toString());
    res.json({ success: true, wishlistIds: activeIds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getWishlist, toggleWishlist, removeFromWishlist, getWishlistIds };
