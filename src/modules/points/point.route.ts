import { Router } from "express";
import { authGuard, allowRole } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { getMyPoints, redeemPoints } from "./point.controller";
import { pointValidation } from "./point.validation";

const router = Router();

router.use(authGuard, allowRole("user"));

router.get("/get-my-points", getMyPoints);

router.post(
  "/redeem-points",
  validateRequest(pointValidation.redeemPointsSchema),
  redeemPoints,
);

export const pointRoute = router;
