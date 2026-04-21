import { Router } from "express";
import { authGuard, allowRole } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { updateAdminConfigSchema } from "./admin.validation";
import { 
  getStats, 
  getConfig, 
  updateConfig, 
  getCrowdfundingStats,
  approveReportPoints
} from "./admin.controller";

const router = Router();

// Public routes
router.get("/crowdfunding", getCrowdfundingStats);

// Admin routes
router.get("/stats", authGuard, allowRole("admin"), getStats);
router.get("/config", authGuard, allowRole("admin"), getConfig);
router.patch(
  "/config", 
  authGuard, 
  allowRole("admin"), 
  validateRequest(updateAdminConfigSchema), 
  updateConfig
);

router.patch(
  "/approve-report-points/:reportId",
  authGuard,
  allowRole("admin"),
  approveReportPoints
);

export const adminRoute = router;
