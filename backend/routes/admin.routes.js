const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const {
  getDashboardStats, getAIAnalysis,
  getAllProducts, createProduct, updateProduct, deleteProduct,
  getAllOrders, updateOrderStatus,
  getAllUsers, updateUser, deleteUser, toggleBlockUser,
  getMarketingLogs, triggerMarketing,
} = require("../controllers/admin.controller");

router.use(protect, adminOnly);

// Dashboard
router.get("/dashboard", getDashboardStats);
router.get("/dashboard/ai-analysis", getAIAnalysis);

// Product CRUD
router.get("/products", getAllProducts);
router.post("/products", upload.single("image"), createProduct);
router.put("/products/:id", upload.single("image"), updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

// Users
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/toggle-block", toggleBlockUser);

// Marketing
router.get("/marketing/logs", getMarketingLogs);
router.post("/marketing/trigger", triggerMarketing);

module.exports = router;
