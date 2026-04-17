import { Request, Response } from "express";
import config from "../config";
import { paymentService } from "../modules/payment/payment.service";
import { donationService } from "../modules/donation/donation.service";
import {
  PaymentCurrency,
  PaymentProvider,
  PaymentStatus,
} from "../modules/payment/payment.interface";

const verifyPayPalWebhook = async (
  headers: Record<string, string>,
  rawBody: string,
): Promise<boolean> => {
  const { clientId, clientSecret, mode, webhookId } = config.paypal;

  const baseUrl =
    mode === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

  // Access token নাও
  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) return false;

  // Signature verify করো
  const verifyRes = await fetch(
    `${baseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        client_id: clientId,
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    },
  );

  const verifyData = await verifyRes.json();
  return verifyData.verification_status === "SUCCESS";
};

export const paypalWebhookHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const rawBody = JSON.stringify(req.body);

  // Signature verify করো
  const isValid = await verifyPayPalWebhook(
    req.headers as Record<string, string>,
    rawBody,
  );

  if (!isValid) {
    res.status(400).json({ message: "PayPal webhook verification failed" });
    return;
  }

  const event = req.body;

  try {
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        const capture = event.resource;
        const captureId = capture.id;
        const amount = parseFloat(capture.amount.value);
        const currency =
          capture.amount.currency_code.toLowerCase() as PaymentCurrency;
        const payerEmail = capture.payer?.email_address ?? "";
        const payerName = capture.payer?.name
          ? `${capture.payer.name.given_name} ${capture.payer.name.surname}`
          : "";

        // Payment record তৈরি করো
        const payment = await paymentService.handleWebhookPayment(
          PaymentProvider.PAYPAL,
          captureId,
          PaymentStatus.COMPLETED,
          { payerEmail, payerName },
          amount,
          currency,
        );

        // Donation record তৈরি করো
        await donationService.createDonationFromPayment(payment);

        break;
      }

      case "PAYMENT.CAPTURE.DENIED": {
        const capture = event.resource;
        await paymentService.handleWebhookPayment(
          PaymentProvider.PAYPAL,
          capture.id,
          PaymentStatus.FAILED,
          {},
          0,
          "eur" as PaymentCurrency,
        );
        break;
      }

      case "PAYMENT.CAPTURE.REFUNDED": {
        const capture = event.resource;
        await paymentService.handleWebhookPayment(
          PaymentProvider.PAYPAL,
          capture.id,
          PaymentStatus.REFUNDED,
          {},
          0,
          "eur" as PaymentCurrency,
        );
        break;
      }

      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    res.status(500).json({ message: "Webhook processing failed" });
  }
};
