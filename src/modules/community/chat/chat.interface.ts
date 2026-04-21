import { Document, Types } from "mongoose";
import { GeoPoint } from "../shared/geo.utils";

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  FILE = "file",
}

export interface IChatMedia {
  url: string;
  publicId: string;
  type: MediaType;
}

// Populated replyTo snapshot — just enough info for UI to render the quoted message
export interface IReplySnapshot {
  _id: Types.ObjectId;
  content: string;
  user: {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    profileImage?: {
      public_id: string;
      secure_url: string;
    };
  };
}

export interface IChat extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  media: IChatMedia[];
  location: GeoPoint;
  geohash: string;
  likesCount: number;
  replyTo?: Types.ObjectId | IReplySnapshot; // ObjectId when stored, IReplySnapshot when populated
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChatPayload {
  user: Types.ObjectId;
  content: string;
  media?: IChatMedia[];
  lat: number;
  lng: number;
  address?: string;
  replyTo?: string; // raw string from req.body, validated in service
}

export interface GetLocalChatQuery {
  lat: number | undefined;
  lng: number | undefined;
  radiusKm?: number | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface GetGlobalChatQuery {
  page?: number | undefined;
  limit?: number | undefined;
}
