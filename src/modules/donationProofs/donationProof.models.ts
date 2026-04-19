import mongoose, { Model, Schema } from "mongoose";
import { DonationProofStatus, IDonationProof } from "./donationProof.interface";

const donationProofSchema = new Schema<IDonationProof>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collectionPoint: {
      type: Schema.Types.ObjectId,
      ref: "PartnerAd",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    photo: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
    status: {
      type: String,
      enum: Object.values(DonationProofStatus),
      default: DonationProofStatus.PENDING,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    adminNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

donationProofSchema.index({ user: 1, status: 1 });
donationProofSchema.index({ status: 1 });

export const donationProofModel: Model<IDonationProof> = mongoose.model<IDonationProof>(
  "DonationProof",
  donationProofSchema
);
