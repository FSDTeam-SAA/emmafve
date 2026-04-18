import { Socket } from "socket.io";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  currentGeohashes?: string[];
}

export interface SocketLocationPayload {
  lat: number;
  lng: number;
}

export interface SocketTypingPayload {
  lat: number;
  lng: number;
  isTyping: boolean;
}

export enum ChatSocketEvents {
  // Client → Server
  LOCATION_UPDATE = "location:update",
  CHAT_TYPING = "chat:typing",

  // Server → Client
  CHAT_NEW_MESSAGE = "chat:newMessage",
  CHAT_LIKE_UPDATE = "chat:likeUpdate",
  CHAT_MESSAGE_DELETED = "chat:messageDeleted",
  CHAT_USER_TYPING = "chat:userTyping",
  CHAT_ERROR = "chat:error",
}
