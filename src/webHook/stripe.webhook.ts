import { Request, Response } from "express";
import Stripe from "stripe";
import { paymentService } from "../modules/payment/payment.service";
import { PaymentStatus } from "../modules/payment/payment.interface";
import { donationService } from "../modules/donation/donation.service";
import config from "../config";
import { getIo } from "../socket/server";
import mongoose from "mongoose";
import { donationModel } from "../modules/donation/donation.models";

export const stripeWebhookHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log("🔥 WEBHOOK HIT:", req.originalUrl);
  console.log("HEADERS:", req.headers["stripe-signature"]);
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
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          const paymentIntent = event.data.object;

          const payment = await paymentService.handleStripeWebhook(
            paymentIntent.id,
            PaymentStatus.COMPLETED,
            paymentIntent.metadata,
            paymentIntent.amount,
            paymentIntent.currency,
          );

          // 🔥 update donation
          await donationModel.updateOne(
            { payment: payment._id },
            { $set: { status: "COMPLETED" } },
            { session },
          );

          const io = getIo();

          io.to(payment.payerEmail).emit("payment:update", {
            paymentIntentId: paymentIntent.id,
            status: "COMPLETED",
          });

          await session.commitTransaction();
          session.endSession();
        } catch (err) {
          await session.abortTransaction();
          session.endSession();
          throw err;
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          const paymentIntent = event.data.object;

          const payment = await paymentService.handleStripeWebhook(
            paymentIntent.id,
            PaymentStatus.FAILED,
            paymentIntent.metadata,
            paymentIntent.amount,
            paymentIntent.currency,
          );

          await donationModel.updateOne(
            { payment: payment._id },
            { $set: { status: "FAILED" } },
            { session },
          );

          const io = getIo();

          io.to(payment.payerEmail).emit("payment:update", {
            paymentIntentId: paymentIntent.id,
            status: "FAILED",
          });
          await session.commitTransaction();
          session.endSession();
        } catch (err) {
          await session.abortTransaction();
          session.endSession();
          throw err;
        }

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
