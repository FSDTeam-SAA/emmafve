import { Request } from "express";
import { Document } from "mongoose";

// req.user is now globally defined in src/types/index.d.ts Haus

export enum role {
  ADMIN = "admin",
  USER = "user",
  PARTNERS = "partners",
}

export enum authProvider {
  GOOGLE = "google",
  APPLE = "apple",
  LOCAL = "local",
}



export enum status {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
  // DELETED = "deleted",
  BANNED = "banned",
  PENDING = "pending",
  REJECT = "reject",
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  provider: authProvider;
  password?: string;
  role: string;
  profession: string;
  profileImage: {
    public_id: string;
    secure_url: string;
  };
  status: status;
  selfIntroduction: string;
  address: string;
  location?: {
    type: string;
    coordinates: number[];
    address?: string;
  };
  company?: string;
  pointsBalance: number;
  isVerified: boolean;
  verificationOtp: string | null;
  verificationOtpExpire: Date | null;
  refreshToken: string | null;
  resetPassword: {
    otp: string | null;
    otpExpire: Date | null;
    token: string | null;
    tokenExpire: Date | null;
  };
  rememberMe: boolean;
  fcmTokens: string[];
  lastLogin: Date;
  comparePassword: (password: string) => Promise<boolean>;
  createAccessToken: () => string;
  createRefreshToken: () => string;
  generateResetPasswordToken(): string;
  verifyResetPasswordToken(token: string): any;
  updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean>;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  company?: string;
  profession?: string;
  selfIntroduction?: string;
  status?: status;
}
