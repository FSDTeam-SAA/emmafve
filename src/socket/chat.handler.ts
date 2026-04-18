import { Server } from "socket.io";
import {
  AuthenticatedSocket,
  ChatSocketEvents,
  SocketLocationPayload,
  SocketTypingPayload,
} from "./socket.type";
import {
  getGeohashWithNeighbors,
  encodeGeohash,
  isValidCoordinates,
} from "../modules/community/shared/geo.utils";

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

  // Typing indicator — emit to sender's single cell (not all 9)
  socket.on(ChatSocketEvents.CHAT_TYPING, (payload: SocketTypingPayload) => {
    try {
      const { lat, lng, isTyping } = payload;

      if (!isValidCoordinates(lat, lng)) return;

      const geohash = encodeGeohash(lat, lng); // changed: single cell

      socket.to(`geo:${geohash}`).emit(ChatSocketEvents.CHAT_USER_TYPING, {
        userId: socket.userId,
        isTyping,
      });
    } catch (error) {
      // silent fail
    }
  });
};
