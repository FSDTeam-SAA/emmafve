import { Document, Types } from "mongoose";

export interface IChatLike extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  chat: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToggleLikePayload {
  user: Types.ObjectId;
  chatId: string;
}

export interface ToggleLikeResult {
  liked: boolean;
  likesCount: number;
}

export interface GetLikesQuery {
  chatId: string;
  page?: number | undefined;
  limit?: number | undefined;
}
