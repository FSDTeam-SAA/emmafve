import { Document, Types } from "mongoose";

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId | string;
  report: Types.ObjectId | string;
  image?: {
    public_id: string;
    secure_url: string;
  };
  parent?: Types.ObjectId | string; // For replies
  likes: (Types.ObjectId | string)[]; // Array of user IDs who liked the comment
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentPayload {
  content: string;
  reportId: string;
  parentId?: string;
  image?: {
    public_id: string;
    secure_url: string;
  };
}

export interface UpdateCommentPayload {
  content: string;
}
