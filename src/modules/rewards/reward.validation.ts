import { z } from "zod";
import {
  RedemptionStatus,
  RewardCategory,
  RewardItemType,
} from "./reward.interface";

// Reuseable helper for enum error messages
const createEnumError = (name: string, enumObj: object) => ({
  message: `${name} is invalid. Allowed values are: ${Object.values(enumObj).join(", ")}`,
});

const pointsSchema = z.coerce.number().min(0, "Points must be 0 or higher");
const stockSchema = z.coerce.number().min(0, "Stock must be 0 or higher");
const pageSchema = z.coerce.number().min(1, "Page must be 1 or higher").optional().default(1);
const limitSchema = z.coerce.number().min(1, "Limit must be 1 or higher").optional().default(10);
const dateSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "Invalid date format. Expected YYYY-MM-DD or ISO string",
}).optional();

// --- Body Schemas ---

export const createRewardItemSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    points: pointsSchema,
    type: z.enum(Object.values(RewardItemType) as [string, ...string[]], createEnumError("Type", RewardItemType)),
    category: z.enum(Object.values(RewardCategory) as [string, ...string[]], createEnumError("Category", RewardCategory)),
    stock: stockSchema.optional().default(0),
    isActive: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
    image: z.any().optional(),
  })
  .strict();

export const updateRewardItemSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    points: pointsSchema.optional(),
    type: z.enum(Object.values(RewardItemType) as [string, ...string[]], createEnumError("Type", RewardItemType)).optional(),
    category: z.enum(Object.values(RewardCategory) as [string, ...string[]], createEnumError("Category", RewardCategory)).optional(),
    stock: stockSchema.optional(),
    isActive: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
    image: z.any().optional(),
  })
  .strict();

export const updateRedemptionStatusSchema = z
  .object({
    status: z.enum(Object.values(RedemptionStatus) as [string, ...string[]], createEnumError("Status", RedemptionStatus)),
    giftCardCode: z.string().optional(),
  })
  .strict();

// --- Query Schemas ---

export const getAllRewardsQuerySchema = z
  .object({
    page: pageSchema,
    limit: limitSchema,
    category: z.enum(Object.values(RewardCategory) as [string, ...string[]], createEnumError("Category", RewardCategory)).optional(),
    type: z.enum(Object.values(RewardItemType) as [string, ...string[]], createEnumError("Type", RewardItemType)).optional(),
    search: z.string().optional(),
    isActive: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  })
  .strict();

export const getAllRedemptionsQuerySchema = z
  .object({
    page: pageSchema,
    limit: limitSchema,
    status: z.enum(Object.values(RedemptionStatus) as [string, ...string[]], createEnumError("Status", RedemptionStatus)).optional(),
    search: z.string().optional(),
    from: dateSchema,
    to: dateSchema,
    sort: z.enum(["ascending", "descending"], { message: "Sort must be 'ascending' or 'descending'" }).optional(),
    sortBy: z.enum(["date", "points", "status"], { message: "SortBy must be 'date', 'points', or 'status'" }).optional(),
  })
  .strict();

// --- Param Schemas ---

export const rewardIdParamSchema = z.object({
  rewardId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Reward ID format (Expected 24-char hex)"),
});

export const redemptionIdParamSchema = z.object({
  redemptionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Redemption ID format (Expected 24-char hex)"),
});

export const rewardValidation = {
  createRewardItemSchema,
  updateRewardItemSchema,
  updateRedemptionStatusSchema,
  getAllRewardsQuerySchema,
  getAllRedemptionsQuerySchema,
  rewardIdParamSchema,
  redemptionIdParamSchema,
};
