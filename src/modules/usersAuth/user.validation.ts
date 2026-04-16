import { z } from "zod";
import { status } from "./user.interface";

//update user info schema
export const updateUserSchema = z
  .object({
    // Basic info
    firstName: z.string().min(1, "First name cannot be empty").optional(),
    lastName: z.string().min(1, "Last name cannot be empty").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    company: z.string().optional(),
    selfIntroduction: z
      .string()
      .max(100, "Self introduction cannot be longer than 100 characters")
      .optional(),
    profession: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    status: z.enum(Object.values(status) as [string, ...string[]]).optional(),
    image: z.any().optional(),
  })
  .strict();

export const updateStatusSchema = z
  .object({
    status: z.enum(Object.values(status) as [string, ...string[]]).optional(),
  })
  .strict();

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      ),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      ),
  })
  .strict()
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  });

export const updateFcmTokenSchema = z
  .object({
    fcmToken: z.string().min(1, "FCM token cannot be empty"),
  })
  .strict();
