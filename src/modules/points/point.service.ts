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
};
