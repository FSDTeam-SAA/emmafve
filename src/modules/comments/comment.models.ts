import { Schema, model } from "mongoose";
import { IComment } from "./comment.interface";

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    report: {
      type: Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    image: {
      public_id: { type: String },
      secure_url: { type: String },
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for replies
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parent",
});

// Index for performance
commentSchema.index({ report: 1, createdAt: -1 });

export const commentModel = model<IComment>("Comment", commentSchema);
