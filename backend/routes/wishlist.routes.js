const express = require("express");
const router = express.Router();
const { getWishlist, toggleWishlist, removeFromWishlist, getWishlistIds } = require("../controllers/wishlist.controller");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getWishlist);
router.get("/ids", getWishlistIds);
router.post("/:productId", toggleWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
