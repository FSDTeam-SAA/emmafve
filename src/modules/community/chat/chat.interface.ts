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

export interface IChat extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  media: IChatMedia[];
  location: GeoPoint;
  geohash: string;
  likesCount: number;
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
