import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { myanimalService } from "./myanimal.service";

export const createMyanimal = asyncHandler(async (req: Request, res: Response) => {
  const item = await myanimalService.createMyanimal(req);
  ApiResponse.sendSuccess(res, 201, "Animal created successfully", item);
});

export const getAllMyanimals = asyncHandler(async (req: Request, res: Response) => {
  const { items, meta } = await myanimalService.getAllMyanimals(req);
  ApiResponse.sendSuccess(res, 200, "Animals retrieved successfully", items, meta);
});

export const getMyAnimals = asyncHandler(async (req: Request, res: Response) => {
  const items = await myanimalService.getMyAnimals(req);
  ApiResponse.sendSuccess(res, 200, "My animals retrieved successfully", items);
});

export const getMyanimalById = asyncHandler(async (req: Request, res: Response) => {
  const item = await myanimalService.getMyanimalById(req.params.id as string);
  ApiResponse.sendSuccess(res, 200, "Animal retrieved successfully", item);
});

export const updateMyanimal = asyncHandler(async (req: Request, res: Response) => {
  const item = await myanimalService.updateMyanimal(req);
  ApiResponse.sendSuccess(res, 200, "Animal updated successfully", item);
});

export const deleteMyanimal = asyncHandler(async (req: Request, res: Response) => {
  await myanimalService.deleteMyanimal(req);
  ApiResponse.sendSuccess(res, 200, "Animal deleted successfully");
});
