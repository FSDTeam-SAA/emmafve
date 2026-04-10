import { Router } from "express";
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  addImage,
  removeImage,
} from "./report.controller";
import { authGuard } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import {
  createReportSchema,
  updateReportSchema,
} from "./report.validation";
import { upload } from "../../middleware/multer.midleware";

const router = Router();

// Public routes (or authentication required based on your app's needs)
// If you want everyone to see reports:
router.get("/get-all-reports", getAllReports);
router.get("/get-single-report/:reportId", getReportById);

// Protected routes (requires login)
router.use(authGuard);

router.post(
  "/create-report",
  upload.fields([{ name: "images", maxCount: 3 }]),
  validateRequest(createReportSchema),
  createReport
);

router.patch(
  "/update-report/:reportId",
  upload.fields([{ name: "images", maxCount: 3 }]),
  validateRequest(updateReportSchema),
  updateReport
);

router.delete("/delete-report/:reportId", deleteReport);

router.post("/add-image/:reportId", upload.single("image"), addImage);

router.delete("/remove-image/:reportId", removeImage);

export const reportRoute = router;
