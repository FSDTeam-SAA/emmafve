import mongoose, { Model, Schema } from "mongoose";
import { IStory, StoryMediaType } from "./stories.interface";

const storyMediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(StoryMediaType),
      required: true,
    },
  },
  { _id: false },
);

const storySchema = new Schema<IStory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: {
      type: storyMediaSchema,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
    },
    geohash: {
      type: String,
      required: true,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Geospatial index
storySchema.index({ location: "2dsphere" });

// TTL index — auto-delete documents when expiresAt is reached
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Time-based sorting
storySchema.index({ createdAt: -1 });

// User's own stories
storySchema.index({ user: 1, createdAt: -1 });

export const storyModel: Model<IStory> = mongoose.model<IStory>(
  "Story",
  storySchema,
);
