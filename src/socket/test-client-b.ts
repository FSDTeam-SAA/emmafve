import chalk from "chalk";
import { io as socketIoClient } from "socket.io-client";

// ─────────────────────────────────────────────
// USER B CONFIG — Marseille (700km from Paris)
// ─────────────────────────────────────────────
const SERVER_URL = "http://localhost:5000";

// Replace with User B's JWT access token
const JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWUwMDlmY2M4ZWJjMDg5ZTVlMjYxZjIiLCJlbWFpbCI6InVzZXJAZ21haWwuY29tIiwiaWF0IjoxNzc2NTQ4OTAxLCJleHAiOjE3NzY2MzUzMDF9.8NQYGSYxd69SZT4N4skHgpHSQRZQ0q43knDGxCWOl5k";
// Marseille coordinates
const USER_LOCATION = {
  lat: 43.2965,
  lng: 5.3698,
};

const USER_NAME = "User B (Marseille)";
// ─────────────────────────────────────────────

const socket = socketIoClient(SERVER_URL, {
  auth: { token: JWT_TOKEN },
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log(chalk.green(`✅ ${USER_NAME} connected:`), chalk.blue(socket.id));

  socket.emit("location:update", USER_LOCATION);
  console.log(
    chalk.yellow(`📍 Location sent:`),
    `lat=${USER_LOCATION.lat}, lng=${USER_LOCATION.lng}`,
  );

  console.log(chalk.magenta(`🎧 Listening for events...\n`));
});

socket.on("chat:newMessage", (data) => {
  console.log(chalk.cyan("\n📨 NEW MESSAGE received"));
  console.log("   From:", data?.user?.firstName, data?.user?.lastName);
  console.log("   Content:", data?.content);
  console.log("   Location:", data?.location?.coordinates);
  console.log("   Media count:", data?.media?.length ?? 0);
  console.log("   Chat ID:", data?._id);
});

socket.on("chat:likeUpdate", (data) => {
  console.log(chalk.magenta("\n❤️  LIKE UPDATE"));
  console.log("   Chat ID:", data?.chatId);
  console.log("   Liked by user:", data?.userId);
  console.log("   Action:", data?.liked ? "LIKED" : "UNLIKED");
  console.log("   Total likes:", data?.likesCount);
});

socket.on("chat:messageDeleted", (data) => {
  console.log(chalk.red("\n🗑️  MESSAGE DELETED"));
  console.log("   Chat ID:", data?.chatId);
});

socket.on("chat:userTyping", (data) => {
  console.log(
    chalk.gray(`\n⌨️  User ${data?.userId} typing: ${data?.isTyping}`),
  );
});

socket.on("chat:error", (data) => {
  console.log(chalk.red("\n⚠️  Chat error:"), data);
});

socket.on("disconnect", () => {
  console.log(chalk.red(`\n❌ ${USER_NAME} disconnected`));
});

socket.on("connect_error", (error) => {
  console.log(chalk.red("\n⚠️  Connection error:"), error.message);
});
