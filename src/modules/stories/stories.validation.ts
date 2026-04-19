import { z } from "zod";

export const createStorySchema = z.object({
  caption: z
    .string()
    .trim()
    .max(200, "Caption cannot exceed 200 characters")
    .optional(),
  lat: z.number({ error: "Latitude is required" }).min(-90).max(90),
  lng: z.number({ error: "Longitude is required" }).min(-180).max(180),
  address: z.string().trim().optional(),
});
