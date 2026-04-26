import { z } from "zod";
import { ChatReportReason, ChatReportStatus } from "./chatreport.interface";

export const createChatReportSchema = z.object({
  reason: z.nativeEnum(ChatReportReason, {
    error: `Invalid reason. Must be one of: ${Object.values(ChatReportReason).join(", ")}`,
  }),
  details: z
    .string()
    .trim()
    .max(500, "Details cannot exceed 500 characters")
    .optional(),
});

export const updateChatReportStatusSchema = z.object({
  status: z.nativeEnum(ChatReportStatus, {
    error: `Invalid status. Must be one of: ${Object.values(ChatReportStatus).join(", ")}`,
  }),
});
