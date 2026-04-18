import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { ICreateStories } from "./stories.interface";
import { storiesService } from "./stories.service";

//TODO: customize as needed
export const createStories = asyncHandler(async (req: Request, res: Response) => {
  const data: ICreateStories = req.body;
  const image = req.file as Express.Multer.File | undefined;
  const item = await storiesService.createStories(data, image);
  ApiResponse.sendSuccess(res, 200, "Stories created", item);
});
