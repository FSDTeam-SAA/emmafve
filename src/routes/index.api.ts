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
import { stripeWebhookHandler } from "../webHook/stripe.webhook";
import { paymentRoute } from "../modules/payment/payment.routes";
import { donationRoute } from "../modules/donation/donation.routes";
import { notificationRoute } from "../modules/notifications/notification.route";
import { paypalWebhookHandler } from "../webHook/paypal.webhook";
import { solidarityRoute } from "../modules/solidarity/solidarity.route";
import { rewardRoute } from "../modules/rewards/reward.route";

router.use("/user", userRoute);
router.use("/auth", authRoute);
router.use("/reports", reportRoute);
router.use("/comments", commentRoute);
router.use("/partner-ads", partnerAdRoute);
router.use("/local-missions", localMissionRoute);
router.use("/points", pointRoute);
router.use("/contacts", contactRoute);
// Webhook — raw body লাগবে তাই আলাদা
router.post(
  "/webhook/stripe",

  stripeWebhookHandler,
);
router.post("/webhook/paypal", paypalWebhookHandler);

router.use("/payments", paymentRoute);
router.use("/donations", donationRoute);
router.use("/notifications", notificationRoute);
router.use("/solidarity", solidarityRoute);
router.use("/rewards", rewardRoute);

export default router;
