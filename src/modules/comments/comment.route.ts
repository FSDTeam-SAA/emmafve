import { Router } from "express";
import {
  createComment,
  getCommentsByReport,
  getCommentById,
  updateComment,
  deleteComment,
  createReply,
  updateReply,
  deleteReply,
  toggleLike,
} from "./comment.controller";
import { authGuard } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.midleware";

const router = Router();

// Public routes
router.get("/get-comments-by-report/:reportId", getCommentsByReport);
router.get("/get-single-comment/:commentId", getCommentById);

// Protected routes
router.use(authGuard);

router.post("/create-comment", upload.single("image"), createComment);
router.patch("/update-comment/:commentId", upload.single("image"), updateComment);
router.delete("/delete-comment/:commentId", deleteComment);
router.post("/toggle-like/:commentId", toggleLike);


//here is the api for reply
router.post("/create-reply/:commentId", upload.single("image"), createReply);
router.patch("/update-reply/:replyId", upload.single("image"), updateReply);
router.delete("/delete-reply/:replyId", deleteReply);


export const commentRoute = router;
