import express from "express";
import { createStories } from "./stories.controller";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { createStoriesSchema } from "./stories.validation";
import { uploadSingle } from "../../middleware/multer.midleware";

const router = express.Router();

//TODO: customize as needed

//router.post("/create-stories", uploadSingle("image"), validateRequest(createStoriesSchema), createStories);

export default router;
