import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CustomError from "../../helpers/CustomError";
import config from "../../config";
import { IUser, role, status, authProvider } from "./user.interface";


const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    pointsBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    selfIntroduction: {
      type: String,
      trim: true,
      maxLength: 100,
    },
    profession: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: false,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(role),
      default: role.USER,
    },
    provider: {
      type: String,
      enum: Object.values(authProvider),
      default: authProvider.LOCAL,
    },
    profileImage: {
      public_id: String,
      secure_url: String,
      _id: false,
    },
    status: {
      type: String,
      enum: Object.values(status),
      default: status.ACTIVE,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    verificationOtp: {
      type: String,
      required: false,
    },
    verificationOtpExpire: {
      type: Date,
    },    passwordResetToken: {
      type: String,
    },
    passwordResetExpire: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    resetPassword: {
      otp: {
        type: String,
      },
      otpExpire: {
        type: Date,
      },
      token: {
        type: String,
      },
      tokenExpire: {
        type: Date,
      },
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
    fcmTokens: {
      type: [String],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
      address: String,
    },
  },
  {
    timestamps: true,
  },
);

//
userSchema.pre<IUser>("save", async function () {
  const userModel = this.constructor as Model<IUser>;
  const existingUser = await userModel.findOne({
    email: this.email,
  });

  if (existingUser && existingUser._id.toString() !== this._id.toString()) {
    throw new CustomError(409, "Email already exists");
  }
});

// encrypt password in pre middleware
userSchema.pre<IUser & Document>("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.index(
  { role: 1, company: 1 },
  {
    unique: true,
    partialFilterExpression: { role: role.PARTNERS },
    collation: { locale: "en", strength: 2 },
  },
);

userSchema.index({ location: "2dsphere" }, { sparse: true });

// compare password
userSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// update password method
userSchema.methods.updatePassword = async function (
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  //check current password is valid
  const isValid = await this.comparePassword(currentPassword);
  if (!isValid) {
    throw new CustomError(401, "Current password is incorrect");
  }

  //is match new password to current
  const isMatch = await this.comparePassword(newPassword);
  if (isMatch) {
    throw new CustomError(
      400,
      "New password must be different from current password",
    );
  }

  this.password = newPassword;

  return true;
};
//create access token
userSchema.methods.createAccessToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email },
    config.jwt.accessTokenSecret as string,
    {

      expiresIn:
        config.env === "development"
          ? "1d"
          : this.rememberMe
            ? "3d"
            : "10m",
    },
  );
};

//create refresh token
userSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    { userId: this._id },
    config.jwt.refreshTokenSecret as string,
    {
      expiresIn: config.jwt.refreshTokenExpires as any,
    },
  );
};

//create reset password token
userSchema.methods.generateResetPasswordToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email },
    config.passwordResetTokenSecret as string,
    {
      expiresIn: config.passwordResetTokenExpire as any,
    },
  );
};

//verify access token
userSchema.methods.verifyAccessToken = function (token: string) {
  return jwt.verify(token, config.jwt.accessTokenSecret as string);
};

//verify refresh token
userSchema.methods.verifyRefreshToken = function (token: string) {
  return jwt.verify(token, config.jwt.refreshTokenSecret as string);
};

export const userModel: Model<IUser> = mongoose.model<IUser>(
  "User",
  userSchema,
);
