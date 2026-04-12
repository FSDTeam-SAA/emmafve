import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { partnerAdService } from "./partnerAd.service";

export const createCollectionPoint = asyncHandler(async (req: Request, res: Response) => {
  const ad = await partnerAdService.createPartnerAd(req);
  ApiResponse.sendSuccess(res, 201, "Collection point submitted successfully", ad);
});

export const getAllPartnerAds = asyncHandler(async (req: Request, res: Response) => {
  const { ads, meta } = await partnerAdService.getAllPartnerAds(req);
  ApiResponse.sendSuccess(res, 200, "Partner ads fetched successfully", ads, meta);
});

export const getMyPartnerAds = asyncHandler(async (req: Request, res: Response) => {
  const ads = await partnerAdService.getMyPartnerAds(req);
  ApiResponse.sendSuccess(res, 200, "My partner ads fetched successfully", ads);
});

export const getPartnerAdById = asyncHandler(async (req: Request, res: Response) => {
  const ad = await partnerAdService.getPartnerAdById(req.params.adId as string);
  ApiResponse.sendSuccess(res, 200, "Partner ad fetched successfully", ad);
});

export const updatePartnerAd = asyncHandler(async (req: Request, res: Response) => {
  const ad = await partnerAdService.updatePartnerAd(req);
  ApiResponse.sendSuccess(res, 200, "Partner ad updated successfully", ad);
});

export const deletePartnerAd = asyncHandler(async (req: Request, res: Response) => {
  await partnerAdService.deletePartnerAd(req);
  ApiResponse.sendSuccess(res, 200, "Partner ad deleted successfully");
});
