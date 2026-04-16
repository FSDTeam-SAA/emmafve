import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { notificationService } from "./notification.service";

export const getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user as any;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await notificationService.getUserNotifications(userId, page, limit);

  ApiResponse.sendSuccess(res, 200, "Notifications fetched successfully", result.notifications, result.meta);
});

export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user as any;
  const { id } = req.params as { id: string };

  const updated = await notificationService.markAsRead(userId, id);

  if (!updated) {
    ApiResponse.sendError(res, 404, "Notification not found or already read");
    return;
  }

  ApiResponse.sendSuccess(res, 200, "Notification marked as read successfully", updated);
});
