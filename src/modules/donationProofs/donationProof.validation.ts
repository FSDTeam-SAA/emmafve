import { z } from "zod";
import { DonationCategory, RefusalReason } from "./donationProof.interface";

export const submitDonationProofSchema = z.object({
  amount: z.preprocess((val) => Number(val), z.number().min(0, "Amount must be positive")),
  collectionPointId: z.string().min(1, "Collection point ID is required"),
  category: z.nativeEnum(DonationCategory, {
    error: `Category must be one of: ${Object.values(DonationCategory).join(", ")}`,
  }),
});

export const validateDonationProofSchema = z.object({
  pointsAwarded: z.number().min(0, "Points must be positive"),
  adminNote: z.string().optional(),
});

export const rejectDonationProofSchema = z.object({
  refusalReason: z.nativeEnum(RefusalReason, {
    error: `Refusal reason must be one of: ${Object.values(RefusalReason).join(", ")}`,
  }).optional(),
  adminNote: z.string().optional(),
}).refine(data => data.refusalReason || data.adminNote, {
  message: "Either refusalReason or adminNote must be provided",
});
