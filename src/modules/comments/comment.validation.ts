import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content is required").max(1000, "Comment cannot exceed 1000 characters"),
    reportId: z.string().min(1, "Report ID is required"),
    image: z.any().optional(), // Allowed for multipart/form-data compatibility
  }).strict(),
});

export const createReplySchema = z.object({
  params: z.object({
    commentId: z.string().min(1, "Comment ID is required"),
  }),
  body: z.object({
    content: z.string().min(1, "Content is required").max(1000, "Comment cannot exceed 1000 characters"),
    reportId: z.string().min(1, "Report ID is required"),
    image: z.any().optional(),
  }).strict(),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content cannot be empty").max(1000, "Comment cannot exceed 1000 characters").optional(),
    image: z.any().optional(),
  }).strict(),
});

export const updateReplySchema = z.object({
  params: z.object({
    replyId: z.string().min(1, "Reply ID is required"),
  }),
  body: z.object({
    content: z.string().min(1, "Content cannot be empty").max(1000, "Comment cannot exceed 1000 characters").optional(),
    image: z.any().optional(),
  }).strict(),
});

export const commentValidation = {
  createCommentSchema,
  createReplySchema,
  updateCommentSchema,
  updateReplySchema,
};
