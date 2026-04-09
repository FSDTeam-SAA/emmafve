import { Router } from "express";
import {
  registration,
  verifyAccount,
  login,
  logout,
  forgetPassword,
  verifyOtpForgetPassword,
  resetPassword,
  generateAccessToken,
  googleLogin,
  appleLogin,
} from "./auth.controller";
import { authGuard } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import {
  forgetPasswordSchema,
  loginSchema,
  registerUserSchema,
  resetPasswordSchema,
  verifyAccountSchema,
  verifyOtpSchema,
} from "./auth.validation";
import { rateLimiter } from "../../middleware/rateLimiter.middleware";

const router = Router();

router.post(
  "/register-user",
  validateRequest(registerUserSchema),
  registration,
);

router.post("/login", rateLimiter(1, 5), validateRequest(loginSchema), login);

router.post("/logout", authGuard, logout);

router.post(
  "/forget-password",
  validateRequest(forgetPasswordSchema),
  forgetPassword,
);

router.post(
  "/verify-otp",
  validateRequest(verifyOtpSchema),
  verifyOtpForgetPassword,
);

router.post(
  "/reset-password/:token",
  validateRequest(resetPasswordSchema),
  resetPassword,
);

router
  .route("/verify-account")
  .post(validateRequest(verifyAccountSchema), verifyAccount);

//: Social login routes
router.post("/google-login", googleLogin);
router.post("/apple-login", appleLogin);

//re generate access token
router.post("/generate-access-token", generateAccessToken);

export const authRoute = router;
