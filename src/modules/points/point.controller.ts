import { Request, Response } from "express";
import ApiResponse from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { pointService } from "./point.service";

export const getMyPoints = asyncHandler(async (req: Request, res: Response) => {
  const { balance, transactions, meta } = await pointService.getMyPoints(req);
  ApiResponse.sendSuccess(
    res,
    200,
    "Points fetched successfully",
    { balance, transactions },
    meta,
  );
});

export const redeemPoints = asyncHandler(async (req: Request, res: Response) => {
  const result = await pointService.redeemPoints(req);
  ApiResponse.sendSuccess(res, 200, "Points redeemed successfully", result);
});
