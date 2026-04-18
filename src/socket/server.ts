import { Server, Socket } from "socket.io";
import http from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import CustomError from "../helpers/CustomError";
import config from "../config";
import { AuthenticatedSocket } from "./socket.type";
import { registerChatHandlers } from "./chat.handler";

let io: Server | null = null;

interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

interface JoinChatPayload {
  chatId: string;
}

export const initSocket = (httpServer: http.Server): Server => {
  if (io) return io;

  const allowedOrigins = [
    config.frontendUrl,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Auth middleware: JWT preferred, query userId as fallback
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split("Bearer ")[1];

      // If token provided — verify it (secure path)
      if (token) {
        const decoded = jwt.verify(
          token,
          config.jwt.accessTokenSecret,
        ) as TokenPayload;

        console.log("Decoded, ", decoded);
        if (!decoded || !decoded.userId) {
          return next(new Error("Invalid token"));
        }

        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        return next();
      }

      // Fallback — legacy userId in query (for notification client)
      const queryUserId = socket.handshake.query?.userId as string | undefined;

      if (queryUserId) {
        socket.userId = queryUserId;
        return next();
      }

      // Neither token nor userId — reject
      return next(new Error("Authentication required"));
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.userId})`);

    // Personal room for direct user notifications
    if (socket.userId) {
      socket.join(socket.userId);
    }

    // Legacy chat room support (for 1-on-1 chats if needed later)
    socket.on("joinChat", ({ chatId }: JoinChatPayload) => {
      if (!chatId) return;
      socket.join(chatId);
      console.log(`💬 Joined chat room: ${chatId}`);
    });

    socket.on("leaveChat", ({ chatId }: JoinChatPayload) => {
      if (!chatId) return;
      socket.leave(chatId);
    });

    // Register community chat handlers
    registerChatHandlers(socket);

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = (): Server => {
  if (!io) throw new CustomError(500, "Socket not initialized");
  return io;
};
