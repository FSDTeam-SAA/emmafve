import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { paymentService } from "./payment.service";
import {
  CreatePayPalOrderPayload,
  CreateStripePaymentIntentPayload,
  CapturePayPalOrderPayload,
  PaymentCurrency,
} from "./payment.interface";

const createStripePaymentIntent = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: CreateStripePaymentIntentPayload = req.body;

    const result = await paymentService.createStripePaymentIntent(
      payload as any,
    );

    return ApiResponse.sendSuccess(
      res,
      200,
      "Payment intent created successfully",
      result,
    );
  },
);

const createPayPalOrder = asyncHandler(async (req: Request, res: Response) => {
  const payload: CreatePayPalOrderPayload = req.body;

  const result = await paymentService.createPayPalOrder(payload);

  return ApiResponse.sendSuccess(
    res,
    200,
    "PayPal order created successfully",
    result,
  );
});

const capturePayPalOrder = asyncHandler(async (req: Request, res: Response) => {
  const payload: CapturePayPalOrderPayload = req.body;

  const result = await paymentService.capturePayPalOrder(payload);

  return ApiResponse.sendSuccess(
    res,
    200,
    "PayPal payment captured successfully",
    result,
  );
});

export const paymentController = {
  createStripePaymentIntent,
  createPayPalOrder,
  capturePayPalOrder,
};
