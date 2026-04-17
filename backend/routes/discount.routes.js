const express = require("express");
const router = express.Router();
const { getAll, create, update, remove, toggleActive } = require("../controllers/discount.controller");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);

router.get("/", getAll);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.patch("/:id/toggle", toggleActive);

module.exports = router;
