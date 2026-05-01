const express = require("express");
const router = express.Router();
const { getPersonalizedRecommendations, trackActivity, trackPublicEvent, getMySignals, getSearchSuggestions, trackSearch, chatSearch } = require("../controllers/ai.controller");
const { protect } = require("../middleware/authMiddleware");

// Public — no auth required
router.post("/track-public", trackPublicEvent);
router.get("/search-suggest", getSearchSuggestions);
router.post("/track-search", trackSearch);
router.post("/chat-search", chatSearch);

// Authenticated routes
router.use(protect);
router.get("/recommendations", getPersonalizedRecommendations);
router.get("/my-signals", getMySignals);
router.post("/track", trackActivity);

module.exports = router;
