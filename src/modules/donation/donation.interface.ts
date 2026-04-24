import { Document, Types } from "mongoose";

export enum DonationType {
  ONE_TIME = "one-time",
  MONTHLY = "monthly",
}

export interface IDonationCompanyInfo {
  name: string;
  siren: string;
  legalForm: string;
}

export interface IDonation extends Document {
  payment?: Types.ObjectId;
  method: "stripe" | "paypal" | "collection_point";
  amount: number;
  type: DonationType;
  donorEmail: string;
  donorName: string;
  isCompanyDonation: boolean;
  companyInfo?: IDonationCompanyInfo;
  referenceId?: string;
  status: "pending" | "completed" | "cancelled";
  receiptId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDonationPayload {
  amount: number;
  type: DonationType;
  donorEmail: string;
  donorName: string;
  isCompanyDonation?: boolean;
  companyInfo?: IDonationCompanyInfo;
  payerEmail: string;
  payerName: string;
}

export interface CreateDonationFromPaymentPayload {
  paymentId: Types.ObjectId;
  amount: number;
  donorEmail: string;
  donorName: string;
  type?: DonationType;
  isCompanyDonation?: boolean;
  companyInfo?: IDonationCompanyInfo;
}
