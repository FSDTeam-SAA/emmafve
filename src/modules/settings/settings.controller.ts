import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { settingsService } from "./settings.service";

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const result = await settingsService.getSettings();
  ApiResponse.sendSuccess(res, 200, "Settings fetched successfully", result);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const result = await settingsService.updateSettings(req.body);
  ApiResponse.sendSuccess(res, 200, "Settings updated successfully", result);
});
