import { Request, Response } from "express";
import ApiResponse from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { solidarityService } from "./solidarity.service";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await solidarityService.getProducts();

  ApiResponse.sendSuccess(res, 200, "Products fetched successfully", products);
});

export const getCollections = asyncHandler(async (req: Request, res: Response) => {
  const collections = await solidarityService.getCollections();

  ApiResponse.sendSuccess(res, 200, "Collections fetched successfully", collections);
});
