import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import ApiResponse from "../../../utils/apiResponse";
import { chatReportService } from "./chatreport.service";
import CustomError from "../../../helpers/CustomError";
import { Types } from "mongoose";
import { ChatReportStatus } from "./chatreport.interface";

const createReport = asyncHandler(async (req: Request, res: Response) => {
  const reporter = req.user?._id;
  if (!reporter) throw new CustomError(401, "Unauthorized");

  const { messageId } = req.params;
  const { reason, details } = req.body;

  const report = await chatReportService.createReport({
    reporter: reporter as Types.ObjectId,
    messageId: messageId as string,
    reason,
    details,
  });

  return ApiResponse.sendSuccess(
    res,
    201,
    "Report submitted successfully",
    report,
  );
});

// Admin only
const getAllReports = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query as any;

  const result = await chatReportService.getAllReports(
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined,
    status as ChatReportStatus | undefined,
  );

  return ApiResponse.sendSuccess(
    res,
    200,
    "Reports fetched successfully",
    result.reports,
    result.meta,
  );
});

// Admin only
const updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
  const { reportId } = req.params;
  const { status } = req.body;

  const report = await chatReportService.updateReportStatus(
    reportId as string,
    {
      status,
    },
  );

  return ApiResponse.sendSuccess(
    res,
    200,
    "Report status updated successfully",
    report,
  );
});

export const chatReportController = {
  createReport,
  getAllReports,
  updateReportStatus,
};
