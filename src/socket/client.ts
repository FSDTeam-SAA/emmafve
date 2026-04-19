import chalk from "chalk";
import { io as socketIoClient } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";
const USER_ID = "69e53c744dbed95e8eeb2831"; //  user ID

const socket = socketIoClient(SERVER_URL, {
  query: { userId: USER_ID },
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log(chalk.green("Connected to server at"), chalk.blue(SERVER_URL));
  console.log(`🎧 Listening silently for notifications for user: ${USER_ID}`);

  console.log(chalk.magenta("Solve by guru"));

});

// Emmafve Specific Notification Catcher
socket.on("notification:new", (notification) => {
  console.log(chalk.yellow("🔔 New Notification Received:"));
  console.log("   Title:", notification.title);
  console.log("   Description:", notification.description);
  console.log("   Type:", notification.type);
});

socket.on("disconnect", () => {
  console.log(chalk.red("Disconnected from server"));
});

socket.on("connect_error", (error) => {
  console.log(chalk.yellow("⚠️ Connection Error:"), error.message);
});
