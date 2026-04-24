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
  payment: Types.ObjectId;
  amount: number;
  type: DonationType;
  donorEmail: string;
  donorName: string;
  isCompanyDonation: boolean;
  companyInfo?: IDonationCompanyInfo;
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
  userId?: string | null;
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
