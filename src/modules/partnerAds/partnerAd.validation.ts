import { z } from "zod";
import { PartnerAdStatus } from "./partnerAd.interface";

export const createCollectionPointSchema = z
  .object({
    title: z.string().min(1, "Collection point title is required"),
    description: z.string().min(1, "Collection point description is required"),
    address: z.string().min(1, "Collection point address is required"),
    image: z.any().optional(),
  })
  .strict();

export const updatePartnerAdSchema = z
  .object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    description: z.string().min(1, "Description cannot be empty").optional(),
    address: z.string().min(1, "Address cannot be empty").optional(),
    status: z.enum(Object.values(PartnerAdStatus) as [string, ...string[]]).optional(),
    image: z.any().optional(),
  })
  .strict();

export const partnerAdValidation = {
  createCollectionPointSchema,
  updatePartnerAdSchema,
};
