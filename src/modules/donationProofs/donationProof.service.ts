import { Request } from "express";
import CustomError from "../../helpers/CustomError";
import { uploadCloudinary } from "../../helpers/cloudinary";
import { paginationHelper } from "../../utils/pagination";
import { userModel } from "../usersAuth/user.models";
import { pointTransactionModel } from "../points/point.models";
import { PointTransactionSource, PointTransactionType } from "../points/point.interface";
import { donationProofModel } from "./donationProof.models";
import { DonationProofStatus, SubmitDonationProofPayload, ValidateDonationProofPayload } from "./donationProof.interface";
import { notificationService } from "../notifications/notification.service";
import { NotificationType } from "../notifications/notification.interface";

export const donationProofService = {
  async submitProof(req: Request) {
    const userId = req.user?._id;
    if (!userId) throw new CustomError(401, "Unauthorized access");

    const data: SubmitDonationProofPayload = req.body;
    const file = req.file;

    if (!file) {
      throw new CustomError(400, "Donation slip photo is required");
    }

    const photoResult = await uploadCloudinary(file.path);

    const donationProof = await donationProofModel.create({
      user: userId,
      collectionPoint: data.collectionPointId,
      amount: data.amount,
      photo: {
        public_id: photoResult.public_id,
        secure_url: photoResult.secure_url,
      },
      status: DonationProofStatus.PENDING,
    });

    return donationProof;
  },

  async getPendingProofs(req: Request) {
    const { page: pagebody, limit: limitbody } = req.query;
    const { page, limit, skip } = paginationHelper(pagebody as string, limitbody as string);

    const [proofs, total] = await Promise.all([
      donationProofModel
        .find({ status: DonationProofStatus.PENDING })
        .populate("user", "firstName lastName email")
        .populate("collectionPoint", "title address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      donationProofModel.countDocuments({ status: DonationProofStatus.PENDING }),
    ]);

    return {
      proofs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async validateProof(proofId: string, payload: ValidateDonationProofPayload) {
    const proof = await donationProofModel.findById(proofId);
    if (!proof) throw new CustomError(404, "Donation proof not found");
    if (proof.status !== DonationProofStatus.PENDING) {
      throw new CustomError(400, `Proof is already ${proof.status}`);
    }

    const { pointsAwarded, adminNote } = payload;

    // 1. Update proof status
    proof.status = DonationProofStatus.APPROVED;
    proof.pointsAwarded = pointsAwarded;
    if (adminNote) proof.adminNote = adminNote;
    await proof.save();

    // 2. Award points to user
    await userModel.findByIdAndUpdate(proof.user, {
      $inc: { pointsBalance: pointsAwarded },
    });

    // 3. Create point transaction
    await pointTransactionModel.create({
      user: proof.user,
      type: PointTransactionType.EARN,
      source: PointTransactionSource.PHYSICAL_DONATION,
      points: pointsAwarded,
      note: `Points earned from physical donation of ${proof.amount}. ${adminNote || ""}`,
    });

    // 4. Notify user
    await notificationService.notifySingleUser(
      proof.user.toString(),
      "Donation Approved!",
      `Your physical donation of ${proof.amount} has been approved. You've earned ${pointsAwarded} points.`,
      NotificationType.SYSTEM // Or appropriate type
    );

    return proof;
  },

  async rejectProof(proofId: string, adminNote: string) {
    const proof = await donationProofModel.findById(proofId);
    if (!proof) throw new CustomError(404, "Donation proof not found");
    if (proof.status !== DonationProofStatus.PENDING) {
      throw new CustomError(400, `Proof is already ${proof.status}`);
    }

    proof.status = DonationProofStatus.REJECTED;
    proof.adminNote = adminNote;
    await proof.save();

    // Notify user
    await notificationService.notifySingleUser(
      proof.user.toString(),
      "Donation Proof Rejected",
      `Your physical donation proof has been rejected. Reason: ${adminNote}`,
      NotificationType.SYSTEM
    );

    return proof;
  },
};
