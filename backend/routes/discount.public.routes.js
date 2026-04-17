const express = require("express");
const router = express.Router();
const { validate } = require("../controllers/discount.controller");
const { protect } = require("../middleware/authMiddleware");

// User validate discount code at checkout (requires login)
router.post("/validate", protect, validate);

module.exports = router;
