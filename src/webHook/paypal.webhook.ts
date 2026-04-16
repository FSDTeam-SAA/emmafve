import { Request, Response } from "express";

// PayPal webhook এখন implement করা হয়নি
// Production-এ ngrok দিয়ে URL পাওয়ার পরে implement করতে হবে
// captureOrder response থেকেই payment confirmed হচ্ছে এখন

export const paypalWebhookHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  res.status(200).json({ received: true });
};
