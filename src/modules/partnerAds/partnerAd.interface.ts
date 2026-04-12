import { Document, Types } from "mongoose";

export enum PartnerAdType {
  COLLECTION_POINT = "collection_point",
}

export enum PartnerAdStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface IPartnerAd extends Document {
  partner: Types.ObjectId | string;
  type: PartnerAdType;
  title: string;
  description: string;
  address: string;
  photo?: {
    public_id: string;
    secure_url: string;
  };
  status: PartnerAdStatus;
}

export interface CreatePartnerAdPayload {
  title: string;
  description: string;
  address: string;
}

export interface UpdatePartnerAdPayload {
  title?: string;
  description?: string;
  address?: string;
  status?: PartnerAdStatus;
}
