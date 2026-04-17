const express = require("express");
const router = express.Router();
const { getPersonalizedRecommendations, trackActivity, trackPublicEvent } = require("../controllers/ai.controller");
const { protect } = require("../middleware/authMiddleware");

// Public — no auth required (anonymous behavioral tracking)
router.post("/track-public", trackPublicEvent);

// Authenticated routes
router.use(protect);
router.get("/recommendations", getPersonalizedRecommendations);
router.post("/track", trackActivity);

module.exports = router;
