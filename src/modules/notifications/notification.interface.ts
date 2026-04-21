import { Document, Types } from "mongoose";

export enum NotificationType {
  NEW_REPORT = "new_report",
  NEW_MISSION = "new_mission",
  POINTS_EARNED = "points_earned",
  MISSION_CANCELLED = "mission_cancelled",
  SYSTEM = "system",
  ACCOUNT_UPDATE = "account_update",
  REWARD_UPDATE = "reward_update",
}

export interface INotification extends Document {
  user: Types.ObjectId;
  title: string;
  description: string;
  type: NotificationType;
  isRead: boolean;
}

//edit as you need
