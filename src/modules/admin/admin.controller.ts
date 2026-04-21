import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { adminService } from "./admin.service";

//: get global stats (Admin)
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await adminService.getStats();
  ApiResponse.sendSuccess(res, 200, "Global statistics fetched successfully", stats);
});

//: get admin config (Admin)
export const getConfig = asyncHandler(async (req: Request, res: Response) => {
  const config = await adminService.getConfig();
  ApiResponse.sendSuccess(res, 200, "Admin configuration fetched successfully", config);
});

//: update admin config (Admin)
export const updateConfig = asyncHandler(async (req: Request, res: Response) => {
  const config = await adminService.updateConfig(req.body);
  ApiResponse.sendSuccess(res, 200, "Admin configuration updated successfully", config);
});

//: get crowdfunding stats (Public)
export const getCrowdfundingStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await adminService.getCrowdfundingStats();
  ApiResponse.sendSuccess(res, 200, "Crowdfunding statistics fetched successfully", stats);
});

//: approve report points (Admin)
export const approveReportPoints = asyncHandler(async (req: Request, res: Response) => {
  const { reportId } = req.params;
  const result = await adminService.approveReportPoints(reportId as string);
  ApiResponse.sendSuccess(res, 200, "Report points approved successfully", result);
});
