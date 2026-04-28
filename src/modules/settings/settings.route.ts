import { Router } from "express";
import { authGuard, allowRole } from "../../middleware/auth.middleware";
import { role } from "../usersAuth/user.interface";
import { getSettings, updateSettings } from "./settings.controller";

const router = Router();

// Public route to get settings (e.g. support email)
router.get("/", getSettings);

// Admin only routes
router.patch("/", authGuard, allowRole(role.ADMIN), updateSettings);

export const settingsRoute = router;
