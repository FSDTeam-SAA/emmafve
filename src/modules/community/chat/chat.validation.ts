import { z } from "zod";
import { MediaType } from "./chat.interface";
import { COMMUNITY_CONFIG } from "../shared/community.config";

const mediaSchema = z.object({
  url: z.string({ error: "Media URL is required" }).url("Invalid URL"),
  publicId: z
    .string({ error: "Public ID is required" })
    .min(1, "Public ID is required"),
  type: z.nativeEnum(MediaType, { error: "Invalid media type" }),
});

export const createChatSchema = z.object({
  content: z
    .string({ error: "Message content is required" })
    .trim()
    .min(
      COMMUNITY_CONFIG.CHAT_MESSAGE_MIN_LENGTH,
      `Message must be at least ${COMMUNITY_CONFIG.CHAT_MESSAGE_MIN_LENGTH} character`,
    )
    .max(
      COMMUNITY_CONFIG.CHAT_MESSAGE_MAX_LENGTH,
      `Message cannot exceed ${COMMUNITY_CONFIG.CHAT_MESSAGE_MAX_LENGTH} characters`,
    ),
  lat: z
    .number({ error: "Latitude is required" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  lng: z
    .number({ error: "Longitude is required" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  address: z.string().trim().optional(),
  media: z
    .array(mediaSchema)
    .max(
      COMMUNITY_CONFIG.CHAT_MEDIA_MAX_COUNT,
      `Maximum ${COMMUNITY_CONFIG.CHAT_MEDIA_MAX_COUNT} media files allowed`,
    )
    .optional()
    .default([]),
});
