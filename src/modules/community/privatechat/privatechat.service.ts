import { Types } from "mongoose";
import { conversationModel, privateMessageModel } from "./privatechat.models";
import {
  GetMessagesQuery,
  MarkAsReadPayload,
  PrivateMessageStatus,
  SendPrivateMessagePayload,
  StartConversationPayload,
} from "./privatechat.interface";
import { IChatMedia, MediaType } from "../chat/chat.interface";
import CustomError from "../../../helpers/CustomError";
import { userModel } from "../../usersAuth/user.models";
import { paginationHelper } from "../../../utils/pagination";
import {
  uploadMediaCloudinary,
  deleteCloudinary,
  CloudinaryResourceType,
} from "../../../helpers/cloudinary";
import { getIo } from "../../../socket/server";

import { notificationService } from "../../notifications/notification.service";
import { NotificationType } from "../../notifications/notification.interface";
import { PrivateChatSocketEvents } from "../../../socket/socket.type";

// ─── Media helpers (same pattern as chat.service) ────────────────────────────

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

const uploadPrivateMedia = async (
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

// ─── Conversation ─────────────────────────────────────────────────────────────

// Start or return existing conversation between two users
const startOrGetConversation = async (payload: StartConversationPayload) => {
  const { senderId, receiverId } = payload;

  if (!Types.ObjectId.isValid(receiverId)) {
    throw new CustomError(400, "Invalid receiver ID");
  }

  if (senderId.toString() === receiverId) {
    throw new CustomError(400, "You cannot start a conversation with yourself");
  }

  const receiver = await userModel
    .findById(receiverId)
    .select("_id firstName lastName profileImage status")
    .lean();

  if (!receiver) {
    throw new CustomError(404, "User not found");
  }

  if (receiver.status === "blocked" || receiver.status === "banned") {
    throw new CustomError(403, "Cannot start a conversation with this user");
  }

  const receiverObjectId = new Types.ObjectId(receiverId);

  // Check if conversation already exists
  const existing = await conversationModel
    .findOne({
      participants: { $all: [senderId, receiverObjectId] },
    })
    .populate("participants", "firstName lastName profileImage")
    .populate({
      path: "lastMessage",
      select: "content media createdAt sender",
    })
    .lean();

  if (existing) return existing;

  // Create new conversation
  const conversation = await conversationModel.create({
    participants: [senderId, receiverObjectId],
    unreadCounts: {
      [senderId.toString()]: 0,
      [receiverId]: 0,
    },
  });

  return conversationModel
    .findById(conversation._id)
    .populate("participants", "firstName lastName profileImage")
    .lean();
};

// Get all conversations for a user (inbox)
const getConversations = async (userId: Types.ObjectId) => {
  const conversations = await conversationModel
    .find({ participants: userId })
    .populate("participants", "firstName lastName profileImage")
    .populate({
      path: "lastMessage",
      select: "content media createdAt sender status",
    })
    .sort({ lastMessageAt: -1 })
    .lean();

  // Attach unread count for the requesting user
  return conversations.map((conv) => ({
    ...conv,
    myUnreadCount: conv.unreadCounts?.get
      ? (conv.unreadCounts.get(userId.toString()) ?? 0)
      : ((conv.unreadCounts as any)?.[userId.toString()] ?? 0),
  }));
};

// ─── Messages ─────────────────────────────────────────────────────────────────

const sendMessage = async (
  payload: SendPrivateMessagePayload,
  files?: Express.Multer.File[],
) => {
  const { conversationId, sender, content } = payload;

  if (!Types.ObjectId.isValid(conversationId)) {
    throw new CustomError(400, "Invalid conversation ID");
  }

  const conversation = await conversationModel.findById(conversationId);

  if (!conversation) {
    throw new CustomError(404, "Conversation not found");
  }

  // Make sure sender is a participant
  const isParticipant = conversation.participants
    .map((p) => p.toString())
    .includes(sender.toString());

  if (!isParticipant) {
    throw new CustomError(403, "You are not part of this conversation");
  }

  // Must have content or media
  if (!content?.trim() && (!files || files.length === 0)) {
    throw new CustomError(400, "Message must have content or media");
  }

  let media: IChatMedia[] = [];
  if (files && files.length > 0) {
    media = await uploadPrivateMedia(files);
  }

  const message = await privateMessageModel.create({
    conversation: conversationId,
    sender,
    content: content?.trim() ?? "",
    media,
    status: PrivateMessageStatus.SENT,
  });

  // Find receiver (the other participant)
  const receiverId = conversation.participants
    .find((p) => p.toString() !== sender.toString())
    ?.toString();

  // Update conversation: lastMessage + lastMessageAt + increment receiver's unread count
  const unreadKey = `unreadCounts.${receiverId}`;
  await conversationModel.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    lastMessageAt: message.createdAt,
    $inc: { [unreadKey]: 1 },
  });

  const populatedMessage = await privateMessageModel
    .findById(message._id)
    .populate("sender", "firstName lastName profileImage")
    .lean();

  // ─── Real-time: emit to receiver's personal room ─────────────────
  try {
    const io = getIo();
    if (receiverId) {
      io.to(receiverId).emit(PrivateChatSocketEvents.PRIVATE_NEW_MESSAGE, {
        conversationId,
        message: populatedMessage,
      });
    }
  } catch (_) {
    // silent fail — message is already saved
  }

  // ─── Notification to receiver ────────────────────────────────────
  if (receiverId) {
    const senderUser = await userModel
      .findById(sender)
      .select("firstName lastName")
      .lean();

    const senderName = senderUser
      ? `${senderUser.firstName} ${senderUser.lastName}`
      : "Someone";

    const preview =
      content?.length > 60
        ? `${content.slice(0, 60)}...`
        : content || "Sent an attachment";

    await notificationService.notifySingleUser(
      receiverId,
      `New message from ${senderName}`,
      preview,
      NotificationType.SYSTEM, // no specific type for private message yet — can add later
    );
  }

  return populatedMessage;
};

const getMessages = async (query: GetMessagesQuery) => {
  const { conversationId, page, limit } = query;

  if (!Types.ObjectId.isValid(conversationId as string)) {
    throw new CustomError(400, "Invalid conversation ID");
  }

  const pagination = paginationHelper(String(page), String(limit));

  const [messages, total] = await Promise.all([
    privateMessageModel
      .find({ conversation: conversationId as string })
      .populate("sender", "firstName lastName profileImage")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    privateMessageModel.countDocuments({
      conversation: conversationId as string,
    }),
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

// Mark all unread messages in a conversation as read
const markAsRead = async (payload: MarkAsReadPayload) => {
  const { conversationId, userId } = payload;

  if (!Types.ObjectId.isValid(conversationId as string)) {
    throw new CustomError(400, "Invalid conversation ID");
  }

  const now = new Date();

  // Update all unread messages not sent by this user
  await privateMessageModel.updateMany(
    {
      conversation: conversationId as string,
      sender: { $ne: userId },
      status: { $ne: PrivateMessageStatus.READ },
    },
    {
      status: PrivateMessageStatus.READ,
      readAt: now,
    },
  );

  // Reset this user's unread count in conversation
  const unreadKey = `unreadCounts.${userId.toString()}`;
  await conversationModel.findByIdAndUpdate(conversationId, {
    [unreadKey]: 0,
  });

  // Notify the sender via socket that messages were read
  const conversation = await conversationModel.findById(conversationId).lean();
  if (conversation) {
    const senderId = conversation.participants
      .find((p) => p.toString() !== userId.toString())
      ?.toString();

    if (senderId) {
      try {
        const io = getIo();
        io.to(senderId).emit(PrivateChatSocketEvents.PRIVATE_MESSAGES_READ, {
          conversationId,
          readBy: userId,
          readAt: now,
        });
      } catch (_) {
        // silent fail
      }
    }
  }
};

export const privateChatService = {
  startOrGetConversation,
  getConversations,
  sendMessage,
  getMessages,
  markAsRead,
};
