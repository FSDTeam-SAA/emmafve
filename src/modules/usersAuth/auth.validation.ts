import { z } from "zod";

export const registerUserSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    company: z.string().optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      ),
    role: z.enum(["user", "admin", "partners"]).default("user").optional(),
  })
  .strict();

export const registerPartnerSchema = registerUserSchema
  .omit({ role: true })
  .extend({
    company: z.string().min(1, "Company is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z
      .string()
      .regex(/^\d{5}$/, "Postal code must be a valid 5-digit French postal code"),
    country: z.string().min(1, "Country is required").default("France").optional(),
    latitude: z.coerce
      .number({ message: "Latitude must be a number" })
      .min(-90, "Latitude must be at least -90")
      .max(90, "Latitude must be at most 90"),
    longitude: z.coerce
      .number({ message: "Longitude must be a number" })
      .min(-180, "Longitude must be at least -180")
      .max(180, "Longitude must be at most 180"),
    locationAddress: z.string().min(1, "Location address is required"),
    website: z.string().url("Invalid website URL").optional(),
  })
  .strict();

export const verifyAccountSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      ),
    rememberMe: z.boolean().default(false).optional(),
  })
  .strict();

export const forgetPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address"),
  })
  .strict();

export const verifyOtpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    password: z
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
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resendOtpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
  })
  .strict();
