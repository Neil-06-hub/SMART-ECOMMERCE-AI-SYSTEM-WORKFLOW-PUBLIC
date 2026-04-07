const express = require("express");
const router = express.Router();
const { getNotifications, readAllNotifications, readOneNotification, deleteNotification } = require("../controllers/notification.controller");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", getNotifications);
router.put("/read-all", readAllNotifications);
router.put("/:id/read", readOneNotification);
router.delete("/:id", deleteNotification);

module.exports = router;
