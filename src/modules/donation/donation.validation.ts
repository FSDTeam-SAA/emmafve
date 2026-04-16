import { z } from "zod";
import { DonationType } from "./donation.interface";
import { PaymentCurrency } from "../payment/payment.interface";

const companyInfoSchema = z.object({
  name: z
    .string({ error: "Company name is required" })
    .min(1, "Company name is required"),
  siren: z.string({ error: "SIREN is required" }).min(1, "SIREN is required"),
  legalForm: z
    .string({ error: "Legal form is required" })
    .min(1, "Legal form is required"),
});

const baseDonationSchema = z.object({
  amount: z
    .number({ error: "Amount is required" })
    .min(1, "Amount must be at least 1"),
  currency: z.nativeEnum(PaymentCurrency, { error: "Currency is required" }),
  type: z.nativeEnum(DonationType, { error: "Donation type is required" }),
  donorEmail: z
    .string({ error: "Donor email is required" })
    .email("Invalid email address"),
  donorName: z
    .string({ error: "Donor name is required" })
    .min(1, "Donor name is required"),
  isCompanyDonation: z.boolean().optional().default(false),
  companyInfo: companyInfoSchema.optional(),
});

export const createStripeDonationSchema = baseDonationSchema.refine(
  (data) => {
    if (data.isCompanyDonation && !data.companyInfo) return false;
    return true;
  },
  {
    message: "Company info is required for company donations",
    path: ["companyInfo"],
  },
);

export const createPayPalDonationSchema = baseDonationSchema.refine(
  (data) => {
    if (data.isCompanyDonation && !data.companyInfo) return false;
    return true;
  },
  {
    message: "Company info is required for company donations",
    path: ["companyInfo"],
  },
);

export const capturePayPalDonationSchema = z
  .object({
    orderId: z
      .string({ error: "Order ID is required" })
      .min(1, "Order ID is required"),
    donorEmail: z
      .string({ error: "Donor email is required" })
      .email("Invalid email address"),
    donorName: z
      .string({ error: "Donor name is required" })
      .min(1, "Donor name is required"),
    type: z.nativeEnum(DonationType, { error: "Donation type is required" }),
    isCompanyDonation: z.boolean().optional().default(false),
    companyInfo: companyInfoSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.isCompanyDonation && !data.companyInfo) return false;
      return true;
    },
    {
      message: "Company info is required for company donations",
      path: ["companyInfo"],
    },
  );
