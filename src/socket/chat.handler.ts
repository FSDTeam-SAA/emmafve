import { Server } from "socket.io";
import {
  AuthenticatedSocket,
  ChatSocketEvents,
  PrivateChatSocketEvents,
  PrivateTypingPayload,
  SocketLocationPayload,
  SocketTypingPayload,
} from "./socket.type";
import {
  getGeohashWithNeighbors,
  encodeGeohash,
  isValidCoordinates,
} from "../modules/community/shared/geo.utils";
import { conversationModel } from "../modules/community/privatechat/privatechat.models";


// User joins center cell + 8 neighbors (for boundary coverage)
const joinGeohashRooms = (
  socket: AuthenticatedSocket,
  lat: number,
  lng: number,
): void => {
  if (socket.currentGeohashes && socket.currentGeohashes.length > 0) {
    socket.currentGeohashes.forEach((geohash) => {
      socket.leave(`geo:${geohash}`);
    });
  }

  const geohashes = getGeohashWithNeighbors(lat, lng);
  geohashes.forEach((geohash) => {
    socket.join(`geo:${geohash}`);
  });

  socket.currentGeohashes = geohashes;

  console.log(
    `📍 User ${socket.userId} joined geohash rooms:`,
    geohashes.join(", "),
  );
};

export const registerChatHandlers = (socket: AuthenticatedSocket): void => {
  // ─── Global Chat: location update ──────────────────────────────────
  socket.on(
    ChatSocketEvents.LOCATION_UPDATE,
    (payload: SocketLocationPayload) => {
      try {
        const { lat, lng } = payload;

        if (!isValidCoordinates(lat, lng)) {
          socket.emit(ChatSocketEvents.CHAT_ERROR, {
            message: "Invalid coordinates",
          });
          return;
        }

        joinGeohashRooms(socket, lat, lng);
      } catch (error) {
        socket.emit(ChatSocketEvents.CHAT_ERROR, {
          message: "Failed to update location",
        });
      }
    },
  );

  // ─── Global Chat: typing indicator ─────────────────────────────────
  socket.on(ChatSocketEvents.CHAT_TYPING, (payload: SocketTypingPayload) => {
    try {
      const { lat, lng, isTyping } = payload;

      if (!isValidCoordinates(lat, lng)) return;

      const geohash = encodeGeohash(lat, lng);

      socket.to(`geo:${geohash}`).emit(ChatSocketEvents.CHAT_USER_TYPING, {
        userId: socket.userId,
        isTyping,
      });
    } catch (error) {
      // silent fail
    }
  });

  // ─── Private Chat: typing indicator ────────────────────────────────
  socket.on(
    PrivateChatSocketEvents.PRIVATE_TYPING,
    async (payload: PrivateTypingPayload) => {
      try {
        const { conversationId, isTyping } = payload;

        if (!conversationId || !socket.userId) return;

        // Find the other participant and emit to their personal room
        const conversation = await conversationModel
          .findById(conversationId)
          .select("participants")
          .lean();

        if (!conversation) return;

        const receiverId = conversation.participants
          .find((p) => p.toString() !== socket.userId)
          ?.toString();

        if (!receiverId) return;

        socket
          .to(receiverId)
          .emit(PrivateChatSocketEvents.PRIVATE_USER_TYPING, {
            conversationId,
            userId: socket.userId,
            isTyping,
          });
      } catch (error) {
        // silent fail
      }
    },
  );
};
