import express from "express";
import { chatLikeController } from "./chatlike.controller";
import { authGuard } from "../../../middleware/auth.middleware";

export const chatLikeRoute = express.Router();

chatLikeRoute.post("/:id/toggle", authGuard, chatLikeController.toggleLike);

chatLikeRoute.get("/:id/likes", authGuard, chatLikeController.getLikes);

chatLikeRoute.get(
  "/:id/liked-by-me",
  authGuard,
  chatLikeController.isLikedByUser,
);
