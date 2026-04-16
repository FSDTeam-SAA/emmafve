import { Request, Response } from "express";
import Stripe from "stripe";
import { paymentService } from "../modules/payment/payment.service";
import { PaymentStatus } from "../modules/payment/payment.interface";
import { donationService } from "../modules/donation/donation.service";
import config from "../config";

export const stripeWebhookHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    res.status(400).json({ message: "Stripe signature missing" });
    return;
  }

  let event;

  try {
    event = Stripe.webhooks.constructEvent(
      req.body, // raw body
      signature,
      config.stripe.webhookSecret,
    );
  } catch (error) {
    res.status(400).json({ message: "Webhook signature verification failed" });
    return;
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        const payment = await paymentService.handleStripeWebhook(
          paymentIntent.id,
          PaymentStatus.COMPLETED,
          paymentIntent.metadata,
          paymentIntent.amount,
          paymentIntent.currency,
        );

        // donation record তৈরি করো
        await donationService.createDonationFromPayment(payment);

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;

        await paymentService.handleStripeWebhook(
          paymentIntent.id,
          PaymentStatus.FAILED,
          paymentIntent.metadata,
          paymentIntent.amount,
          paymentIntent.currency,
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
