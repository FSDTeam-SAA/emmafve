import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import CustomError from "./CustomError";
import config from "../config";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName as string,
  api_key: config.cloudinary.apiKey as string,
  api_secret: config.cloudinary.apiSecret as string,
});

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
}

export type CloudinaryResourceType = "image" | "video" | "raw" | "auto";

// Existing — image upload
export const uploadCloudinary = async (
  filePath: string,
): Promise<CloudinaryUploadResult> => {
  try {
    if (!filePath || !fs.existsSync(filePath as string)) {
      throw new CustomError(400, "Image path missing");
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      quality: "auto",
    });

    fs.unlinkSync(filePath);

    return {
      public_id: cloudinaryResponse.public_id,
      secure_url: cloudinaryResponse.secure_url,
      resource_type: cloudinaryResponse.resource_type,
    };
  } catch (error: any) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new CustomError(
      500,
      `Failed to upload image: ${error?.message ?? "Unknown error"}`,
    );
  }
};

// New — handles image, video, raw (pdf, docs)
export const uploadMediaCloudinary = async (
  filePath: string,
  resourceType: CloudinaryResourceType = "auto",
): Promise<CloudinaryUploadResult> => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new CustomError(400, "File path missing");
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: resourceType,
    });

    fs.unlinkSync(filePath);

    return {
      public_id: cloudinaryResponse.public_id,
      secure_url: cloudinaryResponse.secure_url,
      resource_type: cloudinaryResponse.resource_type,
    };
  } catch (error: any) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new CustomError(
      500,
      `Failed to upload file: ${error?.message ?? "Unknown error"}`,
    );
  }
};

// Updated — now accepts resource type (needed for video/raw deletion)
export const deleteCloudinary = async (
  publicId: string,
  resourceType: CloudinaryResourceType = "image",
): Promise<unknown> => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error: any) {
    throw new CustomError(
      500,
      `Failed to delete file from Cloudinary: ${
        error?.message ?? "Unknown error"
      }`,
    );
  }
};
