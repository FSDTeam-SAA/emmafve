import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import ApiResponse from "../../../utils/apiResponse";
import { privateChatService } from "./privatechat.service";
import CustomError from "../../../helpers/CustomError";
import { Types } from "mongoose";

const startOrGetConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const senderId = req.user?._id;
    if (!senderId) throw new CustomError(401, "Unauthorized");

    const { receiverId } = req.body;

    const conversation = await privateChatService.startOrGetConversation({
      senderId: senderId as Types.ObjectId,
      receiverId,
    });

    return ApiResponse.sendSuccess(
      res,
      200,
      "Conversation fetched successfully",
      conversation,
    );
  },
);

const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw new CustomError(401, "Unauthorized");

  const conversations = await privateChatService.getConversations(
    userId as Types.ObjectId,
  );

  return ApiResponse.sendSuccess(
    res,
    200,
    "Conversations fetched successfully",
    conversations,
  );
});

const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const sender = req.user?._id;
  if (!sender) throw new CustomError(401, "Unauthorized");

  const { conversationId } = req.params;
  const { content } = req.body;

  const files = Array.isArray(req.files)
    ? (req.files as Express.Multer.File[])
    : [];

  const message = await privateChatService.sendMessage(
    {
      conversationId: conversationId as string,
      sender: sender as Types.ObjectId,
      content,
    },
    files,
  );

  return ApiResponse.sendSuccess(
    res,
    201,
    "Message sent successfully",
    message,
  );
});

const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { page, limit } = req.query as any;

  const result = await privateChatService.getMessages({
    conversationId: conversationId as string,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  return ApiResponse.sendSuccess(
    res,
    200,
    "Messages fetched successfully",
    result.messages,
    result.meta,
  );
});

const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw new CustomError(401, "Unauthorized");

  const { conversationId } = req.params;

  await privateChatService.markAsRead({
    conversationId: conversationId as string,
    userId: userId as Types.ObjectId,
  });

  return ApiResponse.sendSuccess(res, 200, "Messages marked as read");
});

export const privateChatController = {
  startOrGetConversation,
  getConversations,
  sendMessage,
  getMessages,
  markAsRead,
};
