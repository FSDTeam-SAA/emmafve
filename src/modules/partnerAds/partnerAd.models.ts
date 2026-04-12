import mongoose, { Model, Schema } from "mongoose";
import { IPartnerAd, PartnerAdStatus, PartnerAdType } from "./partnerAd.interface";

const partnerAdSchema = new Schema<IPartnerAd>(
  {
    partner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(PartnerAdType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      public_id: String,
      secure_url: String,
      _id: false,
    },
    status: {
      type: String,
      enum: Object.values(PartnerAdStatus),
      default: PartnerAdStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  },
);

partnerAdSchema.index({ partner: 1, createdAt: -1 });
partnerAdSchema.index({ type: 1, status: 1, createdAt: -1 });

export const partnerAdModel: Model<IPartnerAd> = mongoose.model<IPartnerAd>(
  "PartnerAd",
  partnerAdSchema,
);
