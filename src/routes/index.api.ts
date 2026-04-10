import express from "express";
const router = express.Router();

import { userRoute } from "../modules/usersAuth/user.route";
import { authRoute } from "../modules/usersAuth/auth.route";
import { reportRoute } from "../modules/reports/report.route";

router.use("/user", userRoute);
router.use("/auth", authRoute);
router.use("/reports", reportRoute);

export default router;
