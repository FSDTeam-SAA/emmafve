import express from "express";
import {
  createMyanimal,
  getAllMyanimals,
  getMyAnimals,
  getMyanimalById,
  updateMyanimal,
  deleteMyanimal,
} from "./myanimal.controller";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { createMyanimalSchema, updateMyanimalSchema } from "./myanimal.validation";
import { upload } from "../../middleware/multer.midleware";
import { authGuard } from "../../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/create",
  authGuard,
  upload.single("image"),
  validateRequest(createMyanimalSchema),
  createMyanimal
);

router.get("/get-all", authGuard, getAllMyanimals);

router.get("/mine", authGuard, getMyAnimals);

router.get("/:id", authGuard, getMyanimalById);

router.patch(
  "/:id",
  authGuard,
  upload.single("image"),
  validateRequest(updateMyanimalSchema),
  updateMyanimal
);

router.delete("/:id", authGuard, deleteMyanimal);

export const myanimalRoute = router;

