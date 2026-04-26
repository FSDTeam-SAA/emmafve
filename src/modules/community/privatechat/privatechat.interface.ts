import { Document, Types } from "mongoose";

// ─── Conversation ─────────────────────────────────────────────────────────────

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  lastMessageAt?: Date;
  unreadCounts: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Message ──────────────────────────────────────────────────────────────────

export enum PrivateMessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
}

export interface IPrivateMessageMedia {
  url: string;
  publicId: string;
  type: string;
}

export interface IPrivateMessage extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  media: IPrivateMessageMedia[];
  status: PrivateMessageStatus;
  readAt?: Date;
  replyTo?: Types.ObjectId | IPrivateMessage; // ObjectId when stored, populated when fetched
  createdAt: Date;
  updatedAt: Date;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface StartConversationPayload {
  senderId: Types.ObjectId;
  receiverId: string;
}

export interface SendPrivateMessagePayload {
  conversationId: string;
  sender: Types.ObjectId;
  content: string;
  replyTo?: string; // raw string from req.body
}

export interface GetMessagesQuery {
  conversationId: string;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface MarkAsReadPayload {
  conversationId: string;
  userId: Types.ObjectId;
}
