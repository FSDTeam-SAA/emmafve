import mongoose, { Model, Schema } from "mongoose";
import {
  IChatReport,
  ChatReportReason,
  ChatReportStatus,
} from "./chatreport.interface";

const chatReportSchema = new Schema<IChatReport>(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: Schema.Types.ObjectId,
      ref: "PrivateMessage",
      required: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    reason: {
      type: String,
      enum: Object.values(ChatReportReason),
      required: true,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(ChatReportStatus),
      default: ChatReportStatus.PENDING,
    },
  },
  { timestamps: true },
);

// Prevent duplicate reports on the same message by the same user
chatReportSchema.index({ reporter: 1, message: 1 }, { unique: true });

// Admin fetch — latest first
chatReportSchema.index({ status: 1, createdAt: -1 });

export const chatReportModel: Model<IChatReport> = mongoose.model<IChatReport>(
  "ChatReport",
  chatReportSchema,
);
