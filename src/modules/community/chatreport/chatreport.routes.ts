import express from "express";
import { chatReportController } from "./chatreport.controller";
import { authGuard, allowRole } from "../../../middleware/auth.middleware";
import { validateRequest } from "../../../middleware/validateRequest.middleware";
import {
  createChatReportSchema,
  updateChatReportStatusSchema,
} from "./chatreport.validation";

export const chatReportRoute = express.Router();

// User: report a private message
chatReportRoute.post(
  "/messages/:messageId",
  authGuard,
  validateRequest(createChatReportSchema),
  chatReportController.createReport,
);

// Admin: get all reports
chatReportRoute.get(
  "/",
  authGuard,
  allowRole("admin"),
  chatReportController.getAllReports,
);

// Admin: update report status
chatReportRoute.patch(
  "/:reportId/status",
  authGuard,
  allowRole("admin"),
  validateRequest(updateChatReportStatusSchema),
  chatReportController.updateReportStatus,
);
