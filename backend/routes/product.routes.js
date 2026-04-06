const express = require("express");
const router = express.Router();
const { getProducts, getProductById, getFeaturedProducts, getCategories, addReview } = require("../controllers/product.controller");
const { protect } = require("../middleware/auth");

// Public routes (middleware optional để track nếu đã login)
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/:id", (req, res, next) => {
  // Thêm user vào req nếu có token (optional auth)
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      User.findById(decoded.id).select("-password").then((user) => {
        req.user = user;
        next();
      });
    } catch {
      next();
    }
  } else next();
}, getProductById);

// Protected
router.post("/:id/reviews", protect, addReview);

module.exports = router;
