import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, "Content is required").max(1000, "Comment cannot exceed 1000 characters"),
  reportId: z.string().min(1, "Report ID is required"),
  parentId: z.string().min(1, "Parent comment ID is required").optional(),
  image: z.any().optional(),
}).strict();

export const createReplySchema = z.object({
  content: z.string().min(1, "Content is required").max(1000, "Comment cannot exceed 1000 characters"),
  reportId: z.string().min(1, "Report ID is required"),
  image: z.any().optional(),
}).strict();

export const updateCommentSchema = z.object({
  content: z.string().min(1, "Content cannot be empty").max(1000, "Comment cannot exceed 1000 characters").optional(),
  image: z.any().optional(),
}).strict();

export const updateReplySchema = z.object({
  content: z.string().min(1, "Content cannot be empty").max(1000, "Comment cannot exceed 1000 characters").optional(),
  image: z.any().optional(),
}).strict();

export const commentValidation = {
  createCommentSchema,
  createReplySchema,
  updateCommentSchema,
  updateReplySchema,
};
