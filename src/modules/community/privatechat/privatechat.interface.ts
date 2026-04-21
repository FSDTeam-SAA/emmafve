import { Document, Types } from "mongoose";

// ─── Conversation ────────────────────────────────────────────────────────────

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[]; // always 2 users
  lastMessage?: Types.ObjectId;
  lastMessageAt?: Date;
  // unread count per participant — stored as a Map
  unreadCounts: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Message ─────────────────────────────────────────────────────────────────

export enum PrivateMessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
}

export interface IPrivateMessage extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  media: IPrivateMessageMedia[];
  status: PrivateMessageStatus;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrivateMessageMedia {
  url: string;
  publicId: string;
  type: string; // reuse MediaType from chat.interface if needed
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface StartConversationPayload {
  senderId: Types.ObjectId;
  receiverId: string; // raw string from req.body, validated in service
}

export interface SendPrivateMessagePayload {
  conversationId: string;
  sender: Types.ObjectId;
  content: string;
}

export interface GetMessagesQuery {
  conversationId: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface MarkAsReadPayload {
  conversationId: string | undefined;
  userId: Types.ObjectId;
}
