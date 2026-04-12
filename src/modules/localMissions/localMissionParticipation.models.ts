import mongoose, { Model, Schema } from "mongoose";
import {
  ILocalMissionParticipation,
  LocalMissionParticipationStatus,
} from "./localMission.interface";

const localMissionParticipationSchema = new Schema<ILocalMissionParticipation>(
  {
    mission: {
      type: Schema.Types.ObjectId,
      ref: "LocalMission",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(LocalMissionParticipationStatus),
      default: LocalMissionParticipationStatus.PENDING,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

localMissionParticipationSchema.index({ user: 1, createdAt: -1 });
localMissionParticipationSchema.index({ mission: 1, status: 1, createdAt: -1 });
localMissionParticipationSchema.index({ mission: 1, user: 1 }, { unique: true });

export const localMissionParticipationModel: Model<ILocalMissionParticipation> =
  mongoose.model<ILocalMissionParticipation>(
    "LocalMissionParticipation",
    localMissionParticipationSchema,
  );
