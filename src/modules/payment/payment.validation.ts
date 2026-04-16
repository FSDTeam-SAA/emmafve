import { z } from "zod";
import { PaymentCurrency } from "./payment.interface";

export const createStripePaymentIntentSchema = z.object({
  amount: z
    .number({ error: "Amount is required" })
    .min(1, "Amount must be at least 1"),
  currency: z.nativeEnum(PaymentCurrency, { error: "Currency is required" }),
  payerEmail: z
    .string({ error: "Payer email is required" })
    .email("Invalid email address"),
  payerName: z
    .string({ error: "Payer name is required" })
    .min(1, "Payer name is required"),
});

export const createPayPalOrderSchema = z.object({
  amount: z
    .number({ error: "Amount is required" })
    .min(1, "Amount must be at least 1"),
  currency: z.nativeEnum(PaymentCurrency, { error: "Currency is required" }),
  payerEmail: z
    .string({ error: "Payer email is required" })
    .email("Invalid email address"),
  payerName: z
    .string({ error: "Payer name is required" })
    .min(1, "Payer name is required"),
});

export const capturePayPalOrderSchema = z.object({
  orderId: z
    .string({ error: "Order ID is required" })
    .min(1, "Order ID is required"),
  payerEmail: z
    .string({ error: "Payer email is required" })
    .email("Invalid email address"),
  payerName: z
    .string({ error: "Payer name is required" })
    .min(1, "Payer name is required"),
});
