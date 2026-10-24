
import express from "express";

import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../controller/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.patch("/read-all", protect, markAllNotificationsAsRead);
router.patch("/:id/read", protect, markNotificationAsRead);

export default router;
