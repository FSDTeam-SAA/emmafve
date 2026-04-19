import chalk from "chalk";
import { io as socketIoClient } from "socket.io-client";

// ─────────────────────────────────────────────
// USER A CONFIG — Paris
// ─────────────────────────────────────────────
const SERVER_URL = "http://localhost:5000";

// Replace with User A's JWT access token
const JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWQ4MzU2Mzc1OTRhYmIxNThiOTEwZTgiLCJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwiaWF0IjoxNzc2NTQ4ODc2LCJleHAiOjE3NzY2MzUyNzZ9.njsh2MT2w2ft1VUmdRAipbqmm5fOKbcYEnh_Q1HgRgU";

// Paris coordinates
const USER_LOCATION = {
  lat: 48.8566,
  lng: 2.3522,
};

const USER_NAME = "User A (Paris)";
// ─────────────────────────────────────────────

const socket = socketIoClient(SERVER_URL, {
  auth: { token: JWT_TOKEN },
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log(chalk.green(`✅ ${USER_NAME} connected:`), chalk.blue(socket.id));

  // Emit location to join geohash rooms
  socket.emit("location:update", USER_LOCATION);
  console.log(
    chalk.yellow(`📍 Location sent:`),
    `lat=${USER_LOCATION.lat}, lng=${USER_LOCATION.lng}`,
  );

  console.log(chalk.magenta(`🎧 Listening for events...\n`));
});

// ─────────────────────────────────────────────
// Listen: New Message
// ─────────────────────────────────────────────
socket.on("chat:newMessage", (data) => {
  console.log(chalk.cyan("\n📨 NEW MESSAGE received"));
  console.log("   From:", data?.user?.firstName, data?.user?.lastName);
  console.log("   Content:", data?.content);
  console.log("   Location:", data?.location?.coordinates);
  console.log("   Media count:", data?.media?.length ?? 0);
  console.log("   Chat ID:", data?._id);
});

// ─────────────────────────────────────────────
// Listen: Like Update
// ─────────────────────────────────────────────
socket.on("chat:likeUpdate", (data) => {
  console.log(chalk.magenta("\n❤️  LIKE UPDATE"));
  console.log("   Chat ID:", data?.chatId);
  console.log("   Liked by user:", data?.userId);
  console.log("   Action:", data?.liked ? "LIKED" : "UNLIKED");
  console.log("   Total likes:", data?.likesCount);
});

// ─────────────────────────────────────────────
// Listen: Message Deleted
// ─────────────────────────────────────────────
socket.on("chat:messageDeleted", (data) => {
  console.log(chalk.red("\n🗑️  MESSAGE DELETED"));
  console.log("   Chat ID:", data?.chatId);
});

// ─────────────────────────────────────────────
// Listen: Typing
// ─────────────────────────────────────────────
socket.on("chat:userTyping", (data) => {
  console.log(
    chalk.gray(`\n⌨️  User ${data?.userId} typing: ${data?.isTyping}`),
  );
});

// ─────────────────────────────────────────────
// Listen: Errors
// ─────────────────────────────────────────────
socket.on("chat:error", (data) => {
  console.log(chalk.red("\n⚠️  Chat error:"), data);
});

socket.on("disconnect", () => {
  console.log(chalk.red(`\n❌ ${USER_NAME} disconnected`));
});

socket.on("connect_error", (error) => {
  console.log(chalk.red("\n⚠️  Connection error:"), error.message);
});
