import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { commentService } from "./comment.service";

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.createComment(req);
  ApiResponse.sendSuccess(res, 201, "Comment created successfully", comment);
});

export const getCommentsByReport = asyncHandler(async (req: Request, res: Response) => {
  const { reportId } = req.params;
  const comments = await commentService.getCommentsByReport(reportId as string);
  ApiResponse.sendSuccess(res, 200, "Comments fetched successfully", comments);
});

export const getCommentById = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const comment = await commentService.getCommentById(commentId as string);
  ApiResponse.sendSuccess(res, 200, "Comment fetched successfully", comment);
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.updateComment(req);
  ApiResponse.sendSuccess(res, 200, "Comment updated successfully", comment);
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  if (!userId) throw new Error("User ID not found");
  const { commentId } = req.params;
  await commentService.deleteComment(commentId as string, userId);
  ApiResponse.sendSuccess(res, 200, "Comment deleted successfully");
});

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id?.toString();
  if (!userId) throw new Error("User ID not found");
  const { commentId } = req.params;
  const comment = await commentService.toggleLike(commentId as string, userId);
  ApiResponse.sendSuccess(res, 200, "Like toggled successfully", comment);
});
