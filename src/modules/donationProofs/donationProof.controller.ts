import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { donationProofService } from "./donationProof.service";

//: submit donation proof
export const submitProof = asyncHandler(async (req: Request, res: Response) => {
  const result = await donationProofService.submitProof(req);
  ApiResponse.sendSuccess(res, 201, "Donation proof submitted successfully. Pending admin approval.", result);
});

//: get pending proofs (Admin)
export const getPendingProofs = asyncHandler(async (req: Request, res: Response) => {
  const { proofs, meta } = await donationProofService.getPendingProofs(req);
  ApiResponse.sendSuccess(res, 200, "Pending donation proofs fetched successfully", proofs, meta);
});

//: validate/approve proof (Admin)
export const validateProof = asyncHandler(async (req: Request, res: Response) => {
  const { donationProofId } = req.params;
  const result = await donationProofService.validateProof(donationProofId as string, req.body);
  ApiResponse.sendSuccess(res, 200, "Donation proof approved and points awarded", result);
});

//: reject proof (Admin)
export const rejectProof = asyncHandler(async (req: Request, res: Response) => {
  const { donationProofId } = req.params;
  const { adminNote } = req.body;
  const result = await donationProofService.rejectProof(donationProofId as string, adminNote);
  ApiResponse.sendSuccess(res, 200, "Donation proof rejected", result);
});
