import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { rewardService } from "./reward.service";

export const createRewardItem = asyncHandler(async (req: Request, res: Response) => {
  const reward = await rewardService.createRewardItem(req);
  ApiResponse.sendSuccess(res, 201, "Reward item created successfully", reward);
});

export const getAllRewardItems = asyncHandler(async (req: Request, res: Response) => {
  const { rewards, meta } = await rewardService.getAllRewardItems(req);
  ApiResponse.sendSuccess(res, 200, "Reward items fetched successfully", rewards, meta);
});

export const getRewardItemById = asyncHandler(async (req: Request, res: Response) => {
  const { rewardId } = req.params;
  const reward = await rewardService.getRewardItemById(rewardId as string);
  ApiResponse.sendSuccess(res, 200, "Reward item fetched successfully", reward);
});

export const updateRewardItem = asyncHandler(async (req: Request, res: Response) => {
  const reward = await rewardService.updateRewardItem(req);
  ApiResponse.sendSuccess(res, 200, "Reward item updated successfully", reward);
});

export const deleteRewardItem = asyncHandler(async (req: Request, res: Response) => {
  const { rewardId } = req.params;
  await rewardService.deleteRewardItem(rewardId as string);
  ApiResponse.sendSuccess(res, 200, "Reward item deleted successfully");
});

export const redeemRewardItem = asyncHandler(async (req: Request, res: Response) => {
  const result = await rewardService.redeemRewardItem(req);
  ApiResponse.sendSuccess(res, 201, "Reward redeemed successfully", result);
});

export const getMyRedemptions = asyncHandler(async (req: Request, res: Response) => {
  const redemptions = await rewardService.getMyRedemptions(req);
  ApiResponse.sendSuccess(res, 200, "My redemptions fetched successfully", redemptions);
});

export const getAllRedemptions = asyncHandler(async (req: Request, res: Response) => {
  const { redemptions, meta } = await rewardService.getAllRedemptions(req);
  const message = redemptions.length === 0 ? "No redemptions found" : "All redemptions fetched successfully";
  ApiResponse.sendSuccess(res, 200, message, redemptions, meta);
});

export const updateRedemptionStatus = asyncHandler(async (req: Request, res: Response) => {
  const redemption = await rewardService.updateRedemptionStatus(req);
  ApiResponse.sendSuccess(res, 200, "Redemption status updated successfully", redemption);
});
