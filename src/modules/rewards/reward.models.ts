import mongoose, { Model, Schema } from "mongoose";
import {
  IRedemption,
  IRewardItem,
  RedemptionStatus,
  RewardCategory,
  RewardItemType,
} from "./reward.interface";

const rewardItemSchema = new Schema<IRewardItem>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    photo: {
      public_id: { type: String },
      secure_url: { type: String },
    },
    type: {
      type: String,
      enum: Object.values(RewardItemType),
      required: true,
    },
    amount: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      enum: Object.values(RewardCategory),
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const redemptionSchema = new Schema<IRedemption>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rewardItem: {
      type: Schema.Types.ObjectId,
      ref: "RewardItem",
      required: true,
    },
    pointsAtRedemption: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RedemptionStatus),
      default: RedemptionStatus.PENDING,
    },
    giftCardCode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

redemptionSchema.index({ user: 1, createdAt: -1 });
rewardItemSchema.index({ category: 1, isActive: 1 });

export const rewardItemModel: Model<IRewardItem> = mongoose.model<IRewardItem>(
  "RewardItem",
  rewardItemSchema,
);

export const redemptionModel: Model<IRedemption> = mongoose.model<IRedemption>(
  "Redemption",
  redemptionSchema,
);
