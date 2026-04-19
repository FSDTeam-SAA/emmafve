import mongoose, { Model, Schema } from "mongoose";
import { IChatLike } from "./chatlike.interface";


const chatLikeSchema = new Schema<IChatLike   >(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate likes from same user on same chat
chatLikeSchema.index({ user: 1, chat: 1 }, { unique: true });

// For fetching all likers of a chat
chatLikeSchema.index({ chat: 1, createdAt: -1 });

export const chatLikeModel: Model<IChatLike> = mongoose.model<IChatLike>(
  "ChatLike",
  chatLikeSchema,
);
