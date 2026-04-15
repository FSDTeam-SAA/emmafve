import express from "express";
const router = express.Router();

import { userRoute } from "../modules/usersAuth/user.route";
import { authRoute } from "../modules/usersAuth/auth.route";
import { reportRoute } from "../modules/reports/report.route";
import { commentRoute } from "../modules/comments/comment.route";
import { partnerAdRoute } from "../modules/partnerAds/partnerAd.route";
import { contactRoute } from "../modules/contacts/contact.route";
import { localMissionRoute } from "../modules/localMissions/localMission.route";
import { pointRoute } from "../modules/points/point.route";
import { notificationRoute } from "../modules/notifications/notification.route";

router.use("/user", userRoute);
router.use("/auth", authRoute);
router.use("/reports", reportRoute);
router.use("/comments", commentRoute);
router.use("/partner-ads", partnerAdRoute);
router.use("/local-missions", localMissionRoute);
router.use("/points", pointRoute);
router.use("/contacts", contactRoute);
router.use("/notifications", notificationRoute);

export default router;
