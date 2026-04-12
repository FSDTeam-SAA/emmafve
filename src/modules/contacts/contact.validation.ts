import { z } from "zod";
import { ContactStatus, ContactType } from "./contact.interface";

export const createContactSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(Object.values(ContactType) as [string, ...string[]]),
    description: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
    website: z.string().url("Invalid website URL").optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    status: z.enum(Object.values(ContactStatus) as [string, ...string[]]).optional(),
    image: z.any().optional(),
  })
  .strict();

export const updateContactSchema = createContactSchema.partial().strict();

export const contactValidation = {
  createContactSchema,
  updateContactSchema,
};
