import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import ApiResponse from "../../../utils/apiResponse";

import CustomError from "../../../helpers/CustomError";
import { chatLikeService } from "./chatlike.service";
import { Types } from "mongoose";

const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new CustomError(401, "Unauthorized");
  }

  const { id } = req.params;

  const result = await chatLikeService.toggleLike({
    user: userId as Types.ObjectId,
    chatId: id as string,
  });

  const message = result.liked
    ? "Message liked successfully"
    : "Message unliked successfully";

  return ApiResponse.sendSuccess(res, 200, message, result);
});

const getLikes = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page, limit } = req.query as any;

  const result = await chatLikeService.getLikes({
    chatId: id as string,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  return ApiResponse.sendSuccess(
    res,
    200,
    "Likes fetched successfully",
    result.likes,
    result.meta,
  );
});

const isLikedByUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new CustomError(401, "Unauthorized");
  }

  const { id } = req.params;

  const liked = await chatLikeService.isLikedByUser(
    id as string,
    userId as Types.ObjectId,
  );

  return ApiResponse.sendSuccess(res, 200, "Like status fetched", { liked });
});

export const chatLikeController = {
  toggleLike,
  getLikes,
  isLikedByUser,
};
