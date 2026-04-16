import { Router } from "express";
import { authGuard } from "../../middleware/auth.middleware";
import { getUserNotifications, markNotificationAsRead } from "./notification.controller";

const router = Router();

router.get("/", authGuard, getUserNotifications);
router.patch("/:id/read", authGuard, markNotificationAsRead);

export const notificationRoute = router;
