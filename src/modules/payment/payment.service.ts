import { stripe } from "../../lib/stripe";
import { paymentModel } from "./payment.models";
import {
  CapturePayPalOrderPayload,
  CreatePayPalOrderPayload,
  CreateStripePaymentIntentPayload,
  IPayment,
  PaymentCurrency,
  PaymentProvider,
  PaymentStatus,
} from "./payment.interface";
import CustomError from "../../helpers/CustomError";
import config from "../../config";

/* ================= Stripe ================= */

const createStripePaymentIntent = async (
  payload: CreateStripePaymentIntentPayload,
): Promise<{ clientSecret: string; paymentIntentId: string }> => {
  const { amount, currency, payerEmail, payerName } = payload;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe amounts are in cents
    currency,
    metadata: {
      payerEmail,
      payerName,
    },
  });

  if (!paymentIntent.client_secret) {
    throw new CustomError(500, "Failed to create payment intent");
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};

const handleStripeWebhook = async (
  paymentIntentId: string,
  status: PaymentStatus,
  metadata: Record<string, any>,
  amount: number,
  currency: string,
): Promise<IPayment> => {
  const existing = await paymentModel.findOne({
    provider: PaymentProvider.STRIPE,
    providerTransactionId: paymentIntentId,
  });

  if (existing) {
    existing.status = status;
    await existing.save();
    return existing;
  }

  const payment = await paymentModel.create({
    provider: PaymentProvider.STRIPE,
    providerTransactionId: paymentIntentId,
    amount: amount / 100, // convert back from cents
    currency: currency as PaymentCurrency,
    status,
    payerEmail: metadata.payerEmail,
    payerName: metadata.payerName,
    metadata,
  });

  return payment;
};

/* ================= PayPal ================= */

const getPayPalAccessToken = async (): Promise<string> => {
  const { clientId, clientSecret, mode } = config.paypal;
  const baseUrl =
    mode === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new CustomError(500, "Failed to get PayPal access token");
  }

  return data.access_token;
};

const createPayPalOrder = async (
  payload: CreatePayPalOrderPayload,
): Promise<{ orderId: string }> => {
  const { amount, currency, payerEmail, payerName } = payload;
  const { mode } = config.paypal;

  const baseUrl =
    mode === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2),
          },
          custom_id: JSON.stringify({ payerEmail, payerName }),
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new CustomError(500, "Failed to create PayPal order");
  }

  return { orderId: data.id };
};

const capturePayPalOrder = async (
  payload: CapturePayPalOrderPayload,
): Promise<IPayment> => {
  const { orderId, payerEmail, payerName } = payload;
  const { mode } = config.paypal;

  const baseUrl =
    mode === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new CustomError(500, "Failed to capture PayPal order");
  }

  const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  const capturedAmount =
    data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
  const capturedCurrency =
    data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code;

  if (!captureId) {
    throw new CustomError(500, "PayPal capture ID not found");
  }

  const payment = await paymentModel.create({
    provider: PaymentProvider.PAYPAL,
    providerTransactionId: captureId,
    amount: parseFloat(capturedAmount),
    currency: capturedCurrency.toLowerCase() as PaymentCurrency,
    status: PaymentStatus.COMPLETED,
    payerEmail,
    payerName,
    metadata: data,
  });

  return payment;
};

export const paymentService = {
  createStripePaymentIntent,
  handleStripeWebhook,
  createPayPalOrder,
  capturePayPalOrder,
};
