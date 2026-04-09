import express from "express";
const router = express.Router();

import { userRoute } from "../modules/usersAuth/user.route";
import { authRoute } from "../modules/usersAuth/auth.route";

router.use("/user", userRoute);
router.use("/auth", authRoute);

export default router;
