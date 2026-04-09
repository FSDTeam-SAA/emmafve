import { Router } from "express";
import {
  getalluser,
  getmyprofile,
  getSingleUser,
  updateStatus,
  updatePassword,
  updateUser,
} from "./user.controller";
import { allowRole, authGuard } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.midleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import {
  updatePasswordSchema,
  updateStatusSchema,
  updateUserSchema,
} from "./user.validation";
import { rateLimiter } from "../../middleware/rateLimiter.middleware";

const router = Router();

router.get("/get-all-user", authGuard, allowRole("admin"), getalluser);

router.get("/get-single-user/:userId", authGuard, getSingleUser);

router.get("/get-my-profile", authGuard, getmyprofile);

router.patch(
  "/update-user",
  authGuard,
  upload.single("image"),
  validateRequest(updateUserSchema),
  updateUser,
);

router.patch(
  "/update-status/:userId",
  authGuard,
  allowRole("admin"),
  validateRequest(updateStatusSchema),
  updateStatus,
);

router.patch(
  "/update-password",
  rateLimiter(1, 5),
  authGuard,
  validateRequest(updatePasswordSchema),
  updatePassword,
);

export const userRoute = router;
