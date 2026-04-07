const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, cancelOrder } = require("../controllers/order.controller");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.post("/", createOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

module.exports = router;
