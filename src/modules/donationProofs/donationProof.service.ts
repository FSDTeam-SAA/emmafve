import { Request } from "express";
import CustomError from "../../helpers/CustomError";
import { uploadCloudinary } from "../../helpers/cloudinary";
import { paginationHelper } from "../../utils/pagination";
import { userModel } from "../usersAuth/user.models";
import { pointTransactionModel } from "../points/point.models";
import { PointTransactionSource, PointTransactionType } from "../points/point.interface";
import { donationProofModel } from "./donationProof.models";
import {
  DonationCategory,
  DonationProofStatus,
  RefusalReason,
  SubmitDonationProofPayload,
  ValidateDonationProofPayload,
} from "./donationProof.interface";
import { notificationService } from "../notifications/notification.service";
import { NotificationType } from "../notifications/notification.interface";

import { donationService } from "../donation/donation.service";
import { getIo } from "../../socket/server";

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
      category: data.category,
      photo: {
        public_id: photoResult.public_id,
        secure_url: photoResult.secure_url,
      },
      status: DonationProofStatus.PENDING,
    });

    // Sync with global Donation collection
    const user = await userModel.findById(userId);
    await donationService.syncPhysicalDonation({
      amount: data.amount,
      donorEmail: user?.email || "unknown",
      donorName: `${user?.firstName} ${user?.lastName}`,
      status: "pending",
      referenceId: donationProof._id.toString(),
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
    const proof = await donationProofModel.findById(proofId).populate("user");
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

    // 4. Update status in global Donation collection
    const user: any = proof.user;
    await donationService.syncPhysicalDonation({
      amount: proof.amount,
      donorEmail: user?.email || "unknown",
      donorName: `${user?.firstName} ${user?.lastName}`,
      status: "completed",
      referenceId: proof._id.toString(),
    });

    // 5. Notify user
    await notificationService.notifySingleUser(
      user._id.toString(),
      "Donation Approved!",
      `Your physical donation of ${proof.amount} has been approved. You've earned ${pointsAwarded} points.`,
      NotificationType.SYSTEM // Or appropriate type
    );

    // 6. Real-time update for admins
    try {
      getIo().emit("donation_validation_updated", { proofId, status: proof.status });
    } catch (error) {
      console.error("Socket error:", error);
    }

    return proof;
  },

  async rejectProof(proofId: string, adminNote: string, refusalReason?: string) {
    const proof = await donationProofModel.findById(proofId).populate("user");
    if (!proof) throw new CustomError(404, "Donation proof not found");
    if (proof.status !== DonationProofStatus.PENDING) {
      throw new CustomError(400, `Proof is already ${proof.status}`);
    }

    proof.status = DonationProofStatus.REJECTED;
    proof.adminNote = adminNote;
    if (refusalReason) proof.refusalReason = refusalReason as any;
    await proof.save();

    // Update status in global Donation collection
    const user: any = proof.user;
    await donationService.syncPhysicalDonation({
      amount: proof.amount,
      donorEmail: user?.email || "unknown",
      donorName: `${user?.firstName} ${user?.lastName}`,
      status: "cancelled",
      referenceId: proof._id.toString(),
    });

    // Notify user
    await notificationService.notifySingleUser(
      user._id.toString(),
      "Donation Proof Rejected",
      `Your physical donation proof has been rejected. Reason: ${adminNote}`,
      NotificationType.SYSTEM
    );

    // Real-time update for admins
    try {
      getIo().emit("donation_validation_updated", { proofId, status: proof.status });
    } catch (error) {
      console.error("Socket error:", error);
    }

    return proof;
  },

  async validateAll() {
    const pendingProofs = await donationProofModel.find({ status: DonationProofStatus.PENDING }).populate("user");
    
    if (pendingProofs.length === 0) {
      return { message: "No pending proofs to validate", count: 0 };
    }

    const pointsPerDonation = 15; // Default points
    const adminNote = "Bulk validate by admin";

    const validationPromises = pendingProofs.map(async (proof) => {
      // 1. Update proof status
      proof.status = DonationProofStatus.APPROVED;
      proof.pointsAwarded = pointsPerDonation;
      proof.adminNote = adminNote;
      await proof.save();

      // 2. Award points to user
      await userModel.findByIdAndUpdate(proof.user, {
        $inc: { pointsBalance: pointsPerDonation },
      });

      // 3. Create point transaction
      await pointTransactionModel.create({
        user: proof.user,
        type: PointTransactionType.EARN,
        source: PointTransactionSource.PHYSICAL_DONATION,
        points: pointsPerDonation,
        note: `Points earned from physical donation of ${proof.amount}. ${adminNote}`,
      });

      // 4. Update status in global Donation collection
      const user: any = proof.user;
      await donationService.syncPhysicalDonation({
        amount: proof.amount,
        donorEmail: user?.email || "unknown",
        donorName: `${user?.firstName} ${user?.lastName}`,
        status: "completed",
        referenceId: proof._id.toString(),
      });

      // 5. Notify user
      await notificationService.notifySingleUser(
        user._id.toString(),
        "Donation Approved!",
        `Your physical donation of ${proof.amount} has been approved via bulk validation. You've earned ${pointsPerDonation} points.`,
        NotificationType.SYSTEM
      );

      return proof._id;
    });

    const results = await Promise.all(validationPromises);

    // Real-time update for admins
    try {
      getIo().emit("donation_validation_updated", { bulk: true, count: results.length });
    } catch (error) {
      console.error("Socket error:", error);
    }

    return {
      message: `Successfully validated ${results.length} donations`,
      count: results.length
    };
  },

  async getValidationStats() {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [stats] = await donationProofModel.aggregate([
      {
        $facet: {
          pending: [
            { $match: { status: DonationProofStatus.PENDING } },
            { $count: "count" }
          ],
          currentMonthStats: [
            { $match: { createdAt: { $gte: startOfCurrentMonth } } },
            {
              $group: {
                _id: null,
                validated: { $sum: { $cond: [{ $eq: ["$status", DonationProofStatus.APPROVED] }, 1, 0] } },
                refused: { $sum: { $cond: [{ $eq: ["$status", DonationProofStatus.REJECTED] }, 1, 0] } },
                points: { $sum: "$pointsAwarded" }
              }
            }
          ],
          lastMonthStats: [
            { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            {
              $group: {
                _id: null,
                validated: { $sum: { $cond: [{ $eq: ["$status", DonationProofStatus.APPROVED] }, 1, 0] } },
                refused: { $sum: { $cond: [{ $eq: ["$status", DonationProofStatus.REJECTED] }, 1, 0] } }
              }
            }
          ],
          categoryBreakdown: [
            { $match: { createdAt: { $gte: startOfCurrentMonth }, status: DonationProofStatus.APPROVED } },
            { $group: { _id: { $ifNull: ["$category", DonationCategory.OTHER] }, count: { $sum: 1 } } }
          ],
          refusalReasons: [
            { $match: { status: DonationProofStatus.REJECTED } },
            { $group: { _id: "$refusalReason", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    const pendingCount = stats.pending[0]?.count || 0;
    const current = stats.currentMonthStats[0] || { validated: 0, refused: 0, points: 0 };
    const last = stats.lastMonthStats[0] || { validated: 0, refused: 0 };

    // Calculate growth
    const calculateGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const validatedGrowth = calculateGrowth(current.validated, last.validated);
    const refusedGrowth = calculateGrowth(current.refused, last.refused);

    // Format category breakdown - ensure ALL categories are present even if 0
    const categories = Object.values(DonationCategory);
    const totalCurrentMonthApproved = stats.categoryBreakdown.reduce((acc: number, item: any) => acc + item.count, 0);
    
    const depositsByCategory = categories.map(cat => {
      const found = stats.categoryBreakdown.find((item: any) => item._id === cat);
      return {
        label: cat,
        val: totalCurrentMonthApproved > 0 && found ? Math.round((found.count / totalCurrentMonthApproved) * 100) : 0
      };
    });

    return {
      pendingCount,
      validatedThisMonth: current.validated,
      refusedThisMonth: current.refused,
      pointsGranted: current.points,
      validatedGrowth,
      refusedGrowth,
      depositsByCategory,
      refusalReasons: stats.refusalReasons.map((item: any) => ({
        label: item._id,
        count: item.count
      }))
    };
  }
};

