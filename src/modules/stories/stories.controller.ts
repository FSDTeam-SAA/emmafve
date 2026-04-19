import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import CustomError from "../../helpers/CustomError";
import { storyService } from "./stories.service";
import { Types } from "mongoose";
import ApiResponse from "../../utils/apiResponse";

const createStory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new CustomError(401, "Unauthorized");
  }

  const { caption, lat, lng, address } = req.body;

  if (!req.file) {
    throw new CustomError(400, "Media file is required for story");
  }

  const story = await storyService.createStory(
    {
      user: userId as Types.ObjectId,
      caption,
      lat: Number(lat),
      lng: Number(lng),
      address,
    },
    req.file,
  );

  return ApiResponse.sendSuccess(res, 201, "Story created successfully", story);
});

const getLocalStories = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, radiusKm, page, limit } = req.query as any;

  const result = await storyService.getLocalStories({
    lat: Number(lat),
    lng: Number(lng),
    radiusKm: radiusKm ? Number(radiusKm) : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  return ApiResponse.sendSuccess(
    res,
    200,
    "Local stories fetched successfully",
    result.stories,
    result.meta,
  );
});

const getUserStories = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const stories = await storyService.getUserStories(userId as string);

  return ApiResponse.sendSuccess(
    res,
    200,
    "User stories fetched successfully",
    stories,
  );
});

const getStoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const story = await storyService.getStoryById(id as string);

  // Increment view count (non-blocking)
  storyService.incrementView(id as string).catch(() => null);

  return ApiResponse.sendSuccess(res, 200, "Story fetched successfully", story);
});

const deleteStory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new CustomError(401, "Unauthorized");
  }

  const { id } = req.params;

  await storyService.deleteStory(id as string, userId as Types.ObjectId);

  return ApiResponse.sendSuccess(res, 200, "Story deleted successfully");
});

export const storyController = {
  createStory,
  getLocalStories,
  getUserStories,
  getStoryById,
  deleteStory,
};
