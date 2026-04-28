import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { notificationService } from "./notification.service";

export const getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const { page, limit } = req.query;

  const result = await notificationService.getUserNotifications(userId, page, limit);

  ApiResponse.sendSuccess(res, 200, "Notifications fetched successfully", result.notifications, result.meta);
});

export const getAdminNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;

  const result = await notificationService.getAllAdminNotifications(page, limit);

  ApiResponse.sendSuccess(res, 200, "Admin notifications fetched successfully", result.notifications, result.meta);
});

export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const { notificationId } = req.params as { notificationId: string };

  const updated = await notificationService.markAsRead(userId, notificationId);

  if (!updated) {
    ApiResponse.sendError(res, 404, "Notification not found or already read");
    return;
  }

  ApiResponse.sendSuccess(res, 200, "Notification marked as read successfully", updated);
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const { notificationId } = req.params as { notificationId: string };

  const isDeleted = await notificationService.deleteNotification(userId, notificationId);

  if (!isDeleted) {
    ApiResponse.sendError(res, 404, "Notification not found or access denied");
    return;
  }

  ApiResponse.sendSuccess(res, 200, "Notification deleted successfully");
});

export const sendAdminAlert = asyncHandler(async (req: Request, res: Response) => {
  const { geoTarget, userType, message } = req.body;

  if (!message) {
    ApiResponse.sendError(res, 400, "Message is required");
    return;
  }

  // Determine if we need location-based filtering (PACA region approximation)
  // Or just broadcast to everyone. For simplicity, we can pass geoTarget/userType to the service.
  // We'll add this to the service.
  await notificationService.sendManualAdminAlert(geoTarget, userType, message);

  ApiResponse.sendSuccess(res, 200, "Alert sent successfully");
});
