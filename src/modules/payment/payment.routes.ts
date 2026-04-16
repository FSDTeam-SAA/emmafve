import express from "express";
import { paymentController } from "./payment.controller";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import {
  createStripePaymentIntentSchema,
  createPayPalOrderSchema,
  capturePayPalOrderSchema,
} from "./payment.validation";

export const paymentRoute = express.Router();

// Stripe
paymentRoute.post(
  "/stripe/create-payment-intent",
  validateRequest(createStripePaymentIntentSchema),
  paymentController.createStripePaymentIntent,
);

// PayPal
paymentRoute.post(
  "/paypal/create-order",
  validateRequest(createPayPalOrderSchema),
  paymentController.createPayPalOrder,
);

paymentRoute.post(
  "/paypal/capture-order",
  validateRequest(capturePayPalOrderSchema),
  paymentController.capturePayPalOrder,
);
