import { Router } from "express";
import { authGuard, allowRole } from "../../middleware/auth.middleware";
import { getUserNotifications, getAdminNotifications, markNotificationAsRead, deleteNotification } from "./notification.controller";
import { role } from "../usersAuth/user.interface";

const router = Router();

// Protected routes (requires login)
router.use(authGuard);

router.get("/get-my-notifications", getUserNotifications);
router.patch("/mark-as-read/:notificationId", markNotificationAsRead);
router.delete("/delete-notification/:notificationId", deleteNotification);

// Admin exclusive routes
router.get("/get-all-admin-notifications", allowRole(role.ADMIN), getAdminNotifications);


export const notificationRoute = router;
