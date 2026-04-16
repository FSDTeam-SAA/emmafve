import express from "express";
import { donationController } from "./donation.controller";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import {
  createStripeDonationSchema,
  createPayPalDonationSchema,
  capturePayPalDonationSchema,
} from "./donation.validation";

export const donationRoute = express.Router();

// Stripe
donationRoute.post(
  "/stripe/initiate",
  validateRequest(createStripeDonationSchema),
  donationController.initiateStripeDonation,
);

// PayPal
donationRoute.post(
  "/paypal/initiate",
  validateRequest(createPayPalDonationSchema),
  donationController.initiatePayPalDonation,
);

donationRoute.post(
  "/paypal/capture",
  validateRequest(capturePayPalDonationSchema),
  donationController.capturePayPalDonation,
);
