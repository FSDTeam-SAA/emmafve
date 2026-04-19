import { Router } from "express";
import { authGuard, allowRole } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.midleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import {
  submitDonationProofSchema,
  validateDonationProofSchema,
  rejectDonationProofSchema
} from "./donationProof.validation";
import {
  submitProof,
  getPendingProofs,
  validateProof,
  rejectProof
} from "./donationProof.controller";

const router = Router();

// User routes
router.post(
  "/submit",
  authGuard,
  upload.single("image"),
  validateRequest(submitDonationProofSchema),
  submitProof
);

// Admin routes
router.get(
  "/pending",
  authGuard,
  allowRole("admin"),
  getPendingProofs
);

router.patch(
  "/validate/:donationProofId",
  authGuard,
  allowRole("admin"),
  validateRequest(validateDonationProofSchema),
  validateProof
);

router.patch(
  "/reject/:donationProofId",
  authGuard,
  allowRole("admin"),
  validateRequest(rejectDonationProofSchema),
  rejectProof
);

export const donationProofRoute = router;
