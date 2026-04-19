import { Document, Types } from "mongoose";

export enum DonationProofStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface IDonationProof extends Document {
  user: Types.ObjectId | string;
  collectionPoint: Types.ObjectId | string;
  amount: number;
  photo: {
    public_id: string;
    secure_url: string;
  };
  status: DonationProofStatus;
  pointsAwarded?: number;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmitDonationProofPayload {
  amount: number;
  collectionPointId: string;
}

export interface ValidateDonationProofPayload {
  pointsAwarded: number;
  adminNote?: string;
}
