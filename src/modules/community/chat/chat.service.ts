import { Types } from "mongoose";
import { chatModel } from "./chat.models";
import {
  CreateChatPayload,
  GetLocalChatQuery,
  GetGlobalChatQuery,
  IChat,
  IChatMedia,
  MediaType,
} from "./chat.interface";
import CustomError from "../../../helpers/CustomError";
import {
  toGeoPoint,
  encodeGeohash,
  getGeohashWithNeighbors,
  buildGeoWithinQuery,
  fromGeoPoint,
  calculateDistanceKm,
  Coordinates,
} from "../shared/geo.utils";
import { paginationHelper } from "../../../utils/pagination";
import {
  uploadMediaCloudinary,
  deleteCloudinary,
  CloudinaryResourceType,
} from "../../../helpers/cloudinary";
import { getIo } from "../../../socket/server";
import { ChatSocketEvents } from "../../../socket/socket.type";

const getMediaTypeFromMime = (mimetype: string): MediaType => {
  if (mimetype.startsWith("image/")) return MediaType.IMAGE;
  if (mimetype.startsWith("video/")) return MediaType.VIDEO;
  return MediaType.FILE;
};

const getCloudinaryResourceType = (
  mediaType: MediaType,
): CloudinaryResourceType => {
  if (mediaType === MediaType.IMAGE) return "image";
  if (mediaType === MediaType.VIDEO) return "video";
  return "raw";
};

// Broadcast to all geohash rooms around a location
const broadcastToGeohashes = (
  lat: number,
  lng: number,
  event: string,
  data: unknown,
): void => {
  try {
    const io = getIo();
    const geohash = encodeGeohash(lat, lng); // changed: single cell, not 9

    io.to(`geo:${geohash}`).emit(event, data); // changed: emit once
  } catch (error) {
    console.error("Socket broadcast failed:", error);
  }
};

const uploadChatMedia = async (
  files: Express.Multer.File[],
): Promise<IChatMedia[]> => {
  const uploadedMedia: IChatMedia[] = [];

  try {
    for (const file of files) {
      const mediaType = getMediaTypeFromMime(file.mimetype);
      const resourceType = getCloudinaryResourceType(mediaType);

      const result = await uploadMediaCloudinary(file.path, resourceType);

      uploadedMedia.push({
        url: result.secure_url,
        publicId: result.public_id,
        type: mediaType,
      });
    }

    return uploadedMedia;
  } catch (error) {
    for (const media of uploadedMedia) {
      const resourceType = getCloudinaryResourceType(media.type);
      await deleteCloudinary(media.publicId, resourceType).catch(() => null);
    }
    throw error;
  }
};

const createChat = async (
  payload: CreateChatPayload,
  files?: Express.Multer.File[],
): Promise<IChat> => {
  const { user, content, lat, lng, address } = payload;

  const location = toGeoPoint(lat, lng, address);
  const geohash = encodeGeohash(lat, lng);

  let media: IChatMedia[] = [];
  if (files && files.length > 0) {
    media = await uploadChatMedia(files);
  }

  const chat = await chatModel.create({
    user,
    content,
    media,
    location,
    geohash,
  });

  // Populate user data before broadcasting
  const populatedChat = await chatModel
    .findById(chat._id)
    .populate("user", "firstName lastName profileImage")
    .lean();

  // Broadcast to nearby users
  broadcastToGeohashes(
    lat,
    lng,
    ChatSocketEvents.CHAT_NEW_MESSAGE,
    populatedChat,
  );

  return chat;
};

const getLocalChat = async (query: GetLocalChatQuery) => {
  const { lat, lng, radiusKm, page, limit } = query;
  const pagination = paginationHelper(String(page), String(limit));

  const geoFilter = buildGeoWithinQuery(
    lat as number,
    lng as number,
    radiusKm!,
  );

  const [messages, total] = await Promise.all([
    chatModel
      .find(geoFilter)
      .populate("user", "firstName lastName profileImage")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    chatModel.countDocuments(geoFilter),
  ]);

  const userCoords = { lat, lng };
  const messagesWithDistance = messages.map((msg) => {
    const msgCoords = fromGeoPoint(msg.location);
    const distanceKm = calculateDistanceKm(
      userCoords as Coordinates,
      msgCoords,
    );
    return { ...msg, distanceKm: Number(distanceKm.toFixed(2)) };
  });

  return {
    messages: messagesWithDistance,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
};

const getGlobalChat = async (query: GetGlobalChatQuery) => {
  const { page, limit } = query;
  const pagination = paginationHelper(String(page), String(limit));

  const [messages, total] = await Promise.all([
    chatModel
      .find()
      .populate("user", "firstName lastName profileImage")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    chatModel.countDocuments(),
  ]);

  return {
    messages,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
};

const getChatById = async (chatId: string): Promise<IChat> => {
  if (!Types.ObjectId.isValid(chatId)) {
    throw new CustomError(400, "Invalid chat ID");
  }

  const chat = await chatModel
    .findById(chatId)
    .populate("user", "firstName lastName profileImage");

  if (!chat) {
    throw new CustomError(404, "Chat message not found");
  }

  return chat;
};

const deleteChat = async (
  chatId: string,
  userId: Types.ObjectId,
): Promise<void> => {
  if (!Types.ObjectId.isValid(chatId)) {
    throw new CustomError(400, "Invalid chat ID");
  }

  const chat = await chatModel.findById(chatId);

  if (!chat) {
    throw new CustomError(404, "Chat message not found");
  }

  if (chat.user.toString() !== userId.toString()) {
    throw new CustomError(403, "You can only delete your own messages");
  }

  for (const media of chat.media) {
    const resourceType = getCloudinaryResourceType(media.type);
    await deleteCloudinary(media.publicId, resourceType).catch(() => null);
  }

  const [lng, lat] = chat.location.coordinates;

  await chatModel.findByIdAndDelete(chatId);

  // Notify nearby users that this message was deleted
  broadcastToGeohashes(lat, lng, ChatSocketEvents.CHAT_MESSAGE_DELETED, {
    chatId,
  });
};

export const chatService = {
  createChat,
  getLocalChat,
  getGlobalChat,
  getChatById,
  deleteChat,
  broadcastToGeohashes,
};
