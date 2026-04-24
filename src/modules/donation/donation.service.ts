import { donationModel } from "./donation.models";
import { paymentService } from "../payment/payment.service";
import {
  CreateDonationPayload,
  DonationType,
  IDonation,
} from "./donation.interface";
import {
  IPayment,
  PaymentCurrency,
  PaymentProvider,
} from "../payment/payment.interface";
import CustomError from "../../helpers/CustomError";
import { Types } from "mongoose";

// Stripe এর webhook থেকে call হবে
const createDonationFromPayment = async (
  payment: IPayment,
): Promise<IDonation> => {
  const existing = await donationModel.findOne({ payment: payment._id });
  if (existing) return existing;

  const donationData: any = {
    payment: payment._id,
    amount: payment.amount,
    type: payment.metadata?.donationType ?? DonationType.ONE_TIME,
    donorEmail: payment.payerEmail,
    donorName: payment.payerName,
    isCompanyDonation: payment.metadata?.isCompanyDonation ?? false,
  };

  if (payment.metadata?.companyInfo) {
    donationData.companyInfo = payment.metadata.companyInfo;
  }

  const donation = await donationModel.create(donationData);

  return donation;
};

// Stripe donation শুরু করা
const initiateStripeDonation = async (
  payload: CreateDonationPayload,
): Promise<{ clientSecret: string; paymentIntentId: string }> => {
  const {
    amount,
    donorEmail,
    donorName,
    type,
    isCompanyDonation,
    companyInfo,
  } = payload;

  const result = await paymentService.createStripePaymentIntent({
    amount,
    currency: PaymentCurrency.EUR,
    payerEmail: donorEmail,
    payerName: donorName,
    userId: payload.userId, // 🔥 add this
  } as any);

  // Stripe metadata update করো donation info দিয়ে
  const { stripe } = await import("../../lib/stripe");
  await stripe.paymentIntents.update(result.paymentIntentId, {
    metadata: {
      payerEmail: donorEmail,
      payerName: donorName,
      donationType: type,
      isCompanyDonation: String(isCompanyDonation ?? false),
      companyInfo: companyInfo ? JSON.stringify(companyInfo) : "",
    },
  });

  return result;
};

// PayPal donation শুরু করা
const initiatePayPalDonation = async (
  payload: CreateDonationPayload,
): Promise<{ orderId: string }> => {
  const { amount, donorEmail, donorName } = payload;

  const result = await paymentService.createPayPalOrder({
    amount,
    currency: PaymentCurrency.EUR,
    payerEmail: donorEmail,
    payerName: donorName,
  });

  return result;
};

// PayPal capture — এখানেই donation record তৈরি হবে
const capturePayPalDonation = async (
  payload: CreateDonationPayload & { orderId: string },
): Promise<IDonation> => {
  const {
    orderId,
    donorEmail,
    donorName,
    type,
    isCompanyDonation,
    companyInfo,
  } = payload;

  const payment = await paymentService.capturePayPalOrder({
    orderId,
    payerEmail: donorEmail,
    payerName: donorName,
  });

  const donationData: any = {
    payment: payment._id,
    amount: payment.amount,
    type: type ?? DonationType.ONE_TIME,
    donorEmail,
    donorName,
    isCompanyDonation: isCompanyDonation ?? false,
  };

  if (companyInfo) {
    donationData.companyInfo = companyInfo;
  }

  const donation = await donationModel.create(donationData);

  return donation;
};

export const donationService = {
  createDonationFromPayment,
  initiateStripeDonation,
  initiatePayPalDonation,
  capturePayPalDonation,
};
