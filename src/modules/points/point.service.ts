import { Request } from "express";
import CustomError from "../../helpers/CustomError";
import { paginationHelper } from "../../utils/pagination";
import { userModel } from "../usersAuth/user.models";
import {
  PointTransactionSource,
  PointTransactionType,
  RedeemPointsPayload,
} from "./point.interface";
import { pointTransactionModel } from "./point.models";
import { pointConfigModel } from "./pointConfig.models";
import { UpdatePointConfigPayload } from "./pointConfig.interface";

export const pointService = {
  async getMyPoints(req: Request) {
    const userId = req.user?._id;
    if (!userId) throw new CustomError(401, "Unauthorized access");

    const { page: pagebody, limit: limitbody, from, to, sort, sortBy } = req.query;
    const { page, limit, skip } = paginationHelper(pagebody as string, limitbody as string);
    const filter: any = { user: userId };

    if (from || to) {
      const isValidDate = (date: any) => {
        const parsedDate = new Date(date);
        return !Number.isNaN(parsedDate.getTime());
      };

      if (from && !isValidDate(from)) {
        throw new CustomError(400, "Invalid 'from' date. Format must be YYYY-MM-DD or ISO");
      }

      if (to && !isValidDate(to)) {
        throw new CustomError(400, "Invalid 'to' date. Format must be YYYY-MM-DD or ISO");
      }

      if (from && to && new Date(from as string) > new Date(to as string)) {
        throw new CustomError(400, "'from' date cannot be greater than 'to' date");
      }

      filter.createdAt = {};

      if (from) {
        const fromDate = new Date(from as string);
        fromDate.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to as string);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    if (sort && sort !== "ascending" && sort !== "descending") {
      throw new CustomError(400, "Invalid sort value. Must be 'ascending' or 'descending'");
    }

    const sortFields: Record<string, string> = {
      date: "createdAt",
      points: "points",
      type: "type",
    };
    const sortByValue = typeof sortBy === "string" ? sortBy : "date";
    const sortField = sortFields[sortByValue.toLowerCase()];
    if (!sortField) {
      throw new CustomError(400, `Invalid sortBy value. Must be one of: ${Object.keys(sortFields).join(", ")}`);
    }
    const sortOrder = sort === "ascending" ? 1 : -1;

    const [user, transactions, total] = await Promise.all([
      userModel.findById(userId).select("pointsBalance").lean(),
      pointTransactionModel
        .find(filter)
        .populate("mission", "title description address duration points photo status")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      pointTransactionModel.countDocuments(filter),
    ]);

    if (!user) throw new CustomError(404, "User not found");

    return {
      balance: user.pointsBalance ?? 0,
      transactions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async redeemPoints(req: Request) {
    const userId = req.user?._id;
    if (!userId) throw new CustomError(401, "Unauthorized access");

    const { points, note } = req.body as RedeemPointsPayload;

    const user = await userModel
      .findOneAndUpdate(
        { _id: userId, pointsBalance: { $gte: points } },
        { $inc: { pointsBalance: -points } },
        { new: true },
      )
      .select("pointsBalance")
      .lean();

    if (!user) throw new CustomError(400, "Not enough points to redeem");

    try {
      const transaction = await pointTransactionModel.create({
        user: userId,
        type: PointTransactionType.REDEEM,
        source: PointTransactionSource.REDEEM,
        points: -points,
        ...(note ? { note } : {}),
      });

      return {
        balance: user.pointsBalance,
        transaction,
      };
    } catch (error) {
      await userModel.findByIdAndUpdate(userId, { $inc: { pointsBalance: points } });
      throw error;
    }
  },

  async getConfig() {
    let config = await pointConfigModel.findOne();
    if (!config) {
      config = await pointConfigModel.create({});
    }
    return config;
  },

  async updateConfig(payload: UpdatePointConfigPayload) {
    const config = await pointConfigModel.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
    });
    return config;
  },

  async getAdminStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [stats] = await pointTransactionModel.aggregate([
      {
        $facet: {
          distributed: [
            { $match: { type: PointTransactionType.EARN } },
            { $group: { _id: null, total: { $sum: "$points" } } },
          ],
          thisMonth: [
            { $match: { type: PointTransactionType.EARN, createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$points" } } },
          ],
          exchanged: [
            { $match: { type: PointTransactionType.REDEEM } },
            { $group: { _id: null, total: { $sum: { $abs: "$points" } } } },
          ],
        },
      },
    ]);

    const totalUsersPoints = await userModel.aggregate([
      { $group: { _id: null, total: { $sum: "$pointsBalance" } } },
    ]);

    return {
      distributed: {
        total: stats.distributed[0]?.total || 0,
        thisMonth: stats.thisMonth[0]?.total || 0,
      },
      exchanged: {
        total: stats.exchanged[0]?.total || 0,
      },
      pending: totalUsersPoints[0]?.total || 0,
      expired: 0, // expiration logic not yet implemented
    };
  },
};
