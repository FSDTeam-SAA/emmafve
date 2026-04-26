import { Document, Types } from "mongoose";

export enum MyanimalStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface IMyanimal extends Document {
  user: Types.ObjectId;
  title: string;
  description: string;
  photo?: {
    public_id: string;
    secure_url: string;
  };
  status: MyanimalStatus;
  slug: string;
}

export interface CreateMyanimalPayload {
  title: string;
  description: string;
  status?: MyanimalStatus;
}

export interface UpdateMyanimalPayload {
  title?: string;
  description?: string;
  status?: MyanimalStatus;
}
