import { Document, Types } from "mongoose";

export enum RewardItemType {
  PRODUCT = "product",
  GIFTCARD = "giftcard",
}

export enum RewardCategory {
  LIMITED = "limited",
  FEATURED = "featured",
  SOLIDARITY = "solidarity",
}

export enum RedemptionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface IRewardItem extends Document {
  title: string;
  description: string;
  points: number;
  photo: {
    public_id: string;
    secure_url: string;
  };
  type: RewardItemType;
  category: RewardCategory;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRedemption extends Document {
  user: Types.ObjectId | string;
  rewardItem: Types.ObjectId | string;
  pointsAtRedemption: number;
  status: RedemptionStatus;
  giftCardCode?: string;
  createdAt: Date;
  updatedAt: Date;
}
