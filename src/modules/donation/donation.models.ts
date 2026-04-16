import mongoose, { Model, Schema } from "mongoose";
import { IDonation, DonationType } from "./donation.interface";

const donationSchema = new Schema<IDonation>(
  {
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: Object.values(DonationType),
      required: true,
    },
    donorEmail: {
      type: String,
      required: true,
    },
    donorName: {
      type: String,
      required: true,
    },
    isCompanyDonation: {
      type: Boolean,
      default: false,
    },
    companyInfo: {
      name: { type: String },
      siren: { type: String },
      legalForm: { type: String },
      _id: false,
    },
  },
  {
    timestamps: true,
  },
);

donationSchema.index({ donorEmail: 1 });
donationSchema.index({ type: 1 });
donationSchema.index({ payment: 1 }, { unique: true });
donationSchema.index({ createdAt: -1 });

export const donationModel: Model<IDonation> = mongoose.model<IDonation>(
  "Donation",
  donationSchema,
);
