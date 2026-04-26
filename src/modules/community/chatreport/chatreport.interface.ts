import { Document, Types } from "mongoose";

export enum ChatReportReason {
  SPAM = "spam",
  HARASSMENT = "harassment",
  INAPPROPRIATE = "inappropriate",
  HATE_SPEECH = "hate_speech",
  OTHER = "other",
}

export enum ChatReportStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

export interface IChatReport extends Document {
  _id: Types.ObjectId;
  reporter: Types.ObjectId;
  reportedUser: Types.ObjectId;
  message: Types.ObjectId; // reported PrivateMessage ID
  conversation: Types.ObjectId;
  reason: ChatReportReason;
  details?: string;
  status: ChatReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChatReportPayload {
  reporter: Types.ObjectId;
  messageId: string;
  reason: ChatReportReason;
  details?: string;
}

export interface UpdateChatReportStatusPayload {
  status: ChatReportStatus;
}
