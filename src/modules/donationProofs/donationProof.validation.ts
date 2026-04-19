import { z } from "zod";

export const submitDonationProofSchema = z.object({
  amount: z.preprocess((val) => Number(val), z.number().min(0, "Amount must be positive")),
  collectionPointId: z.string().min(1, "Collection point ID is required"),
});

export const validateDonationProofSchema = z.object({
  pointsAwarded: z.number().min(0, "Points must be positive"),
  adminNote: z.string().optional(),
});

export const rejectDonationProofSchema = z.object({
  adminNote: z.string().min(1, "Rejection reason (adminNote) is required"),
});
