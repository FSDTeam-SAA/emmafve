import mongoose, { Model, Schema } from "mongoose";
import { IChat, MediaType } from "./chat.interface";
import { COMMUNITY_CONFIG } from "../shared/community.config";

const chatMediaSchema = new Schema(
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

const chatSchema = new Schema<IChat>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: COMMUNITY_CONFIG.CHAT_MESSAGE_MIN_LENGTH,
      maxlength: COMMUNITY_CONFIG.CHAT_MESSAGE_MAX_LENGTH,
    },
    media: {
      type: [chatMediaSchema],
      default: [],
      validate: {
        validator: (arr: unknown[]) =>
          arr.length <= COMMUNITY_CONFIG.CHAT_MEDIA_MAX_COUNT,
        message: `Maximum ${COMMUNITY_CONFIG.CHAT_MEDIA_MAX_COUNT} media files allowed`,
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      address: String,
    },
    geohash: {
      type: String,
      required: true,
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Geospatial index for $near and $geoWithin queries
chatSchema.index({ location: "2dsphere" });

// Time-based sorting index
chatSchema.index({ createdAt: -1 });

// Compound index for user-specific message fetching
chatSchema.index({ user: 1, createdAt: -1 });

export const chatModel: Model<IChat> = mongoose.model<IChat>(
  "Chat",
  chatSchema,
);
