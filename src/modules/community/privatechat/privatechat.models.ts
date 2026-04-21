import mongoose, { Model, Schema } from "mongoose";
import {
  IConversation,
  IPrivateMessage,
  PrivateMessageStatus,
} from "./privatechat.interface";
import { MediaType } from "../chat/chat.interface";

// ─── Private Message Media ────────────────────────────────────────────────────

const privateMessageMediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(MediaType),
      required: true,
    },
  },
  { _id: false },
);

// ─── Private Message ──────────────────────────────────────────────────────────

const privateMessageSchema = new Schema<IPrivateMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    media: {
      type: [privateMessageMediaSchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(PrivateMessageStatus),
      default: PrivateMessageStatus.SENT,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

privateMessageSchema.index({ conversation: 1, createdAt: -1 });
privateMessageSchema.index({ conversation: 1, sender: 1, status: 1 });

// ─── Conversation ─────────────────────────────────────────────────────────────

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      required: true,
      validate: {
        validator: (arr: unknown[]) => arr.length === 2,
        message: "A conversation must have exactly 2 participants",
      },
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "PrivateMessage",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// ─── Exports ──────────────────────────────────────────────────────────────────

export const privateMessageModel: Model<IPrivateMessage> =
  mongoose.model<IPrivateMessage>("PrivateMessage", privateMessageSchema);

export const conversationModel: Model<IConversation> =
  mongoose.model<IConversation>("Conversation", conversationSchema);
