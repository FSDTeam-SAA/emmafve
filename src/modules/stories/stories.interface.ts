import { Document, Types } from "mongoose";
import { GeoPoint } from "../community/shared/geo.utils";

export enum StoryMediaType {
  IMAGE = "image",
  VIDEO = "video",
}

export interface IStoryMedia {
  url: string;
  publicId: string;
  type: StoryMediaType;
}

export interface IStory extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | undefined;
  media: IStoryMedia;
  caption?: string | undefined;
  location: GeoPoint;
  geohash: string;
  viewsCount: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStoryPayload {
  user: Types.ObjectId;
  caption?: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface GetStoriesQuery {
  lat: number | undefined;
  lng: number | undefined;
  radiusKm?: number | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}
