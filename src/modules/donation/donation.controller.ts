import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { donationService } from "./donation.service";
import { DonationType } from "./donation.interface";

const initiateStripeDonation = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      amount,
      type,
      donorEmail,
      donorName,
      isCompanyDonation,
      companyInfo,
    } = req.body;

    const result = await donationService.initiateStripeDonation({
      amount,
      type,
      donorEmail,
      donorName,
      isCompanyDonation,
      companyInfo,
      payerEmail: donorEmail,
      payerName: donorName,
    });

    return ApiResponse.sendSuccess(
      res,
      200,
      "Stripe donation initiated successfully",
      result,
    );
  },
);

const initiatePayPalDonation = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      amount,
      type,
      donorEmail,
      donorName,
      isCompanyDonation,
      companyInfo,
    } = req.body;

    const result = await donationService.initiatePayPalDonation({
      amount,
      type,
      donorEmail,
      donorName,
      isCompanyDonation,
      companyInfo,
      payerEmail: donorEmail,
      payerName: donorName,
    });

    return ApiResponse.sendSuccess(
      res,
      200,
      "PayPal donation initiated successfully",
      result,
    );
  },
);

const capturePayPalDonation = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      orderId,
      donorEmail,
      donorName,
      type,
      isCompanyDonation,
      companyInfo,
    } = req.body;

    const result = await donationService.capturePayPalDonation({
      orderId,
      amount: 0, // capture response থেকে আসবে
      type,
      donorEmail,
      donorName,
      isCompanyDonation,
      companyInfo,
      payerEmail: donorEmail,
      payerName: donorName,
    });

    return ApiResponse.sendSuccess(
      res,
      200,
      "PayPal donation captured successfully",
      result,
    );
  },
);

export const donationController = {
  initiateStripeDonation,
  initiatePayPalDonation,
  capturePayPalDonation,
};
