import { Document, Types } from "mongoose";

export enum PointTransactionType {
  EARN = "earn",
  REDEEM = "redeem",
}

export enum PointTransactionSource {
  LOCAL_MISSION = "local_mission",
  REDEEM = "redeem",
  REWARD_ITEM = "reward_item",
  PHYSICAL_DONATION = "physical_donation",
}

export interface IPointTransaction extends Document {
  user: Types.ObjectId | string;
  mission?: Types.ObjectId | string;
  type: PointTransactionType;
  source: PointTransactionSource;
  points: number;
  note?: string;
}

export interface RedeemPointsPayload {
  points: number;
  note?: string;
}
