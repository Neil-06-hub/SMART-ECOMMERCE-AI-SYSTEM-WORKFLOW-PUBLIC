const express = require("express");
const router = express.Router();
const { getPersonalizedRecommendations, trackActivity } = require("../controllers/ai.controller");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/recommendations", getPersonalizedRecommendations);
router.post("/track", trackActivity);

module.exports = router;
