import { userModel } from "../usersAuth/user.models";
import { reportModel } from "../reports/report.models";
import { donationModel } from "../donation/donation.models";
import { donationProofModel } from "../donationProofs/donationProof.models";
import { pointTransactionModel } from "../points/point.models";
import { adminConfigModel } from "./admin.models";
import { status as UserStatus, role as UserRole } from "../usersAuth/user.interface";
import { ReportStatus } from "../reports/report.interface";
import { DonationProofStatus } from "../donationProofs/donationProof.interface";
import { PointTransactionType } from "../points/point.interface";
import { UpdateAdminConfigPayload } from "./admin.interface";

export const adminService = {
  async getStats() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      pendingPartners,
      totalReports,
      resolvedReports,
      lostReports,
      sightedReports,
      digitalDonationsThisMonth,
      physicalDonationsThisMonth,
      pointsEarnedThisMonth,
      pointsRedeemedThisMonth,
    ] = await Promise.all([
      // Users
      userModel.countDocuments(),
      userModel.countDocuments({ status: UserStatus.ACTIVE }),
      userModel.countDocuments({ role: UserRole.PARTNERS, status: UserStatus.PENDING }),

      // Reports
      reportModel.countDocuments(),
      reportModel.countDocuments({ status: { $in: [ReportStatus.FOUND, ReportStatus.RESCUED] } }),
      reportModel.countDocuments({ status: ReportStatus.LOST }),
      reportModel.countDocuments({ status: ReportStatus.SIGHTED }),

      // Donations (Current Month)
      donationModel.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      donationProofModel.aggregate([
        { $match: { status: DonationProofStatus.APPROVED, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // Points (Current Month)
      pointTransactionModel.aggregate([
        { $match: { type: PointTransactionType.EARN, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$points" } } },
      ]),
      pointTransactionModel.aggregate([
        { $match: { type: PointTransactionType.REDEEM, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: { $abs: "$points" } } } },
      ]),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        pendingPartners,
      },
      reports: {
        total: totalReports,
        resolved: resolvedReports,
        lost: lostReports,
        sighted: sightedReports,
      },
      donations: {
        collectedThisMonth: (digitalDonationsThisMonth[0]?.total || 0) + (physicalDonationsThisMonth[0]?.total || 0),
        totalDigital: digitalDonationsThisMonth[0]?.total || 0,
        totalPhysical: physicalDonationsThisMonth[0]?.total || 0,
      },
      points: {
        totalEarnedThisMonth: pointsEarnedThisMonth[0]?.total || 0,
        totalRedeemedThisMonth: pointsRedeemedThisMonth[0]?.total || 0,
      },
    };
  },

  async getConfig() {
    let config = await adminConfigModel.findOne();
    if (!config) {
      config = await adminConfigModel.create({});
    }
    return config;
  },

  async updateConfig(payload: UpdateAdminConfigPayload) {
    let config = await adminConfigModel.findOne();
    if (!config) {
      config = await adminConfigModel.create(payload);
    } else {
      config = await adminConfigModel.findOneAndUpdate({}, payload, { new: true });
    }
    return config;
  },
  
  async getCrowdfundingStats() {
    const config = await this.getConfig();
    return {
      totalCollected: config.crowdfundingTotal,
      goalAmount: config.crowdfundingGoal,
      percentage: config.crowdfundingGoal > 0 
        ? Math.min(100, (config.crowdfundingTotal / config.crowdfundingGoal) * 100)
        : 0
    };
  }
};
