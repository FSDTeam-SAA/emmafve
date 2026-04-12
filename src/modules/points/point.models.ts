import mongoose, { Model, Schema } from "mongoose";
import {
  IPointTransaction,
  PointTransactionSource,
  PointTransactionType,
} from "./point.interface";

const pointTransactionSchema = new Schema<IPointTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mission: {
      type: Schema.Types.ObjectId,
      ref: "LocalMission",
    },
    type: {
      type: String,
      enum: Object.values(PointTransactionType),
      required: true,
    },
    source: {
      type: String,
      enum: Object.values(PointTransactionSource),
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

pointTransactionSchema.index({ user: 1, createdAt: -1 });
pointTransactionSchema.index(
  { user: 1, mission: 1, source: 1 },
  {
    unique: true,
    partialFilterExpression: { source: PointTransactionSource.LOCAL_MISSION },
  },
);

export const pointTransactionModel: Model<IPointTransaction> =
  mongoose.model<IPointTransaction>("PointTransaction", pointTransactionSchema);
