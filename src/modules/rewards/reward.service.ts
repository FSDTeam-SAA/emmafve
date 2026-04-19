import mongoose from "mongoose";
import { Request } from "express";
import CustomError from "../../helpers/CustomError";
import { deleteCloudinary, uploadCloudinary } from "../../helpers/cloudinary";
import { paginationHelper } from "../../utils/pagination";
import { userModel } from "../usersAuth/user.models";
import {
  PointTransactionSource,
  PointTransactionType,
} from "../points/point.interface";
import { pointTransactionModel } from "../points/point.models";
import {
  IRedemption,
  IRewardItem,
  RedemptionStatus,
  RewardCategory,
  RewardItemType,
} from "./reward.interface";
import { redemptionModel, rewardItemModel } from "./reward.models";
import { rewardValidation } from "./reward.validation";

const deleteCloudinaryQuietly = async (publicId?: string): Promise<void> => {
  if (!publicId) return;
  try {
    await deleteCloudinary(publicId);
  } catch (error) {
    console.error(`[Cloudinary] Failed to delete ${publicId}:`, error);
  }
};

export const rewardService = {
  async createRewardItem(req: Request): Promise<IRewardItem> {
    const data = req.body;
    const image = req.file;
    if (!image) throw new CustomError(400, "Reward item photo is required");

    const photo = await uploadCloudinary(image.path);

    try {
      const reward = await rewardItemModel.create({
        ...data,
        photo,
      });
      return reward;
    } catch (error) {
      await deleteCloudinaryQuietly(photo.public_id);
      throw error;
    }
  },

  async getAllRewardItems(req: Request) {
    const {
      page: pagebody,
      limit: limitbody,
      category,
      type,
      search,
      isActive,
    } = req.query;
    const { page, limit, skip } = paginationHelper(
      pagebody as string,
      limitbody as string,
    );

    if (category && !["limited", "featured", "solidarity"].includes(category as string)) {
      throw new CustomError(
        400,
        "Invalid category. Allowed values are: limited, featured, solidarity",
      );
    }

    if (type && !["product", "giftcard"].includes(type as string)) {
      throw new CustomError(
        400,
        "Invalid type. Allowed values are: product, giftcard",
      );
    }

    const filter: any = {};
    if (category) filter.category = category as RewardCategory;
    if (type) filter.type = type as RewardItemType;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const [rewards, total] = await Promise.all([
      rewardItemModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      rewardItemModel.countDocuments(filter),
    ]);

    return {
      rewards,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getRewardItemById(rewardId: string): Promise<IRewardItem> {
    const reward = await rewardItemModel.findById(rewardId);
    if (!reward) throw new CustomError(404, "Reward item not found");
    return reward;
  },

  async updateRewardItem(req: Request): Promise<IRewardItem> {
    const { rewardId } = req.params;
    const data = req.body;
    const image = req.file;

    const reward = await rewardItemModel.findById(rewardId);
    if (!reward) throw new CustomError(404, "Reward item not found");

    const oldPublicId = image ? reward.photo?.public_id : undefined;
    let newPhoto;

    if (image) {
      newPhoto = await uploadCloudinary(image.path);
      reward.photo = newPhoto;
    }

    Object.assign(reward, data);

    try {
      await reward.save();
      if (oldPublicId) await deleteCloudinaryQuietly(oldPublicId);
      return reward;
    } catch (error) {
      if (newPhoto) await deleteCloudinaryQuietly(newPhoto.public_id);
      throw error;
    }
  },

  async deleteRewardItem(rewardId: string): Promise<boolean> {
    const reward = await rewardItemModel.findById(rewardId);
    if (!reward) throw new CustomError(404, "Reward item not found");

    await reward.deleteOne();
    await deleteCloudinaryQuietly(reward.photo?.public_id);
    return true;
  },

  async redeemRewardItem(req: Request) {
    const userId = req.user?._id;
    const { rewardId } = req.params;

    if (!userId) throw new CustomError(401, "Unauthorized access");

    const reward = await rewardItemModel.findById(rewardId);
    if (!reward) throw new CustomError(404, "Reward item not found");
    if (!reward.isActive) throw new CustomError(400, "This reward is not active");
    if (reward.type === RewardItemType.PRODUCT && reward.stock <= 0) {
      throw new CustomError(400, "Out of stock");
    }

    const user = await userModel.findById(userId);
    if (!user) throw new CustomError(404, "User not found");
    if (user.pointsBalance < reward.points) {
      throw new CustomError(400, "Insufficient points balance");
    }

    const session = await mongoose.startSession();
    try {
      let result: any;
      await session.withTransaction(async () => {
        // Deduct points from user
        const updatedUser = await userModel.findByIdAndUpdate(
          userId,
          { $inc: { pointsBalance: -reward.points } },
          { new: true, session },
        );

        if (!updatedUser) throw new CustomError(404, "User not found");

        // Create point transaction
        const transaction = await pointTransactionModel.create(
          [
            {
              user: userId,
              type: PointTransactionType.REDEEM,
              source: PointTransactionSource.REWARD_ITEM,
              points: -reward.points,
              note: `Redeemed reward: ${reward.title}`,
            },
          ],
          { session },
        );

        // Create redemption record
        const redemption = await redemptionModel.create(
          [
            {
              user: userId,
              rewardItem: reward._id,
              pointsAtRedemption: reward.points,
              status: RedemptionStatus.PENDING,
            },
          ],
          { session },
        );

        // Update stock if Product
        if (reward.type === RewardItemType.PRODUCT) {
          reward.stock -= 1;
          await reward.save({ session });
        }

        result = {
          redemption: redemption[0],
          transaction: transaction[0],
          balance: updatedUser.pointsBalance,
        };
      });
      return result;
    } finally {
      await session.endSession();
    }
  },

  async getMyRedemptions(req: Request): Promise<IRedemption[]> {
    const userId = req.user?._id;
    if (!userId) throw new CustomError(401, "Unauthorized access");

    const redemptions = await redemptionModel
      .find({ user: userId })
      .populate("rewardItem")
      .sort({ createdAt: -1 });
    return redemptions;
  },

  async getAllRedemptions(req: Request) {
    const {
      page: pagebody,
      limit: limitbody,
      status,
      search,
      from,
      to,
      sort,
      sortBy,
    } = req.query;

    const { page, limit, skip } = paginationHelper(
      pagebody as string,
      limitbody as string,
    );

    const filter: any = {};
    if (status) {
      if (!["pending", "completed", "cancelled"].includes(status as string)) {
        throw new CustomError(
          400,
          "Invalid status parameter. Only pending, completed and cancelled status is allowed",
        );
      }
      filter.status = status as RedemptionStatus;
    }

    if (sort && !["ascending", "descending"].includes(sort as string)) {
      throw new CustomError(
        400,
        "Invalid sort. Allowed values are: ascending, descending",
      );
    }

    if (sortBy && !["date", "points", "status"].includes(sortBy as string)) {
      throw new CustomError(
        400,
        "Invalid sortBy. Allowed values are: date, points, status",
      );
    }

    if (search) {
      const users = await userModel
        .find({
          $or: [
            { firstName: { $regex: search as string, $options: "i" } },
            { lastName: { $regex: search as string, $options: "i" } },
          ],
        })
        .select("_id")
        .lean();
      filter.user = { $in: users.map((u) => u._id) };
    }

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

    const sortFields: Record<string, string> = {
      date: "createdAt",
      points: "pointsAtRedemption",
      status: "status",
    };
    const sortByValue = typeof sortBy === "string" ? sortBy : "date";
    const sortField = sortFields[sortByValue.toLowerCase()] ?? "createdAt";
    const sortOrder = sort === "ascending" ? 1 : -1;

    const [redemptions, total] = await Promise.all([
      redemptionModel
        .find(filter)
        .populate("user", "firstName lastName email phone address")
        .populate("rewardItem")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      redemptionModel.countDocuments(filter),
    ]);

    return {
      redemptions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateRedemptionStatus(req: Request): Promise<IRedemption> {
    const { redemptionId } = req.params;
    const { status, giftCardCode } = req.body;

    const redemption = await redemptionModel.findById(redemptionId);
    if (!redemption) throw new CustomError(404, "Redemption not found");

    if (status) redemption.status = status as RedemptionStatus;
    if (giftCardCode) redemption.giftCardCode = giftCardCode;

    await redemption.save();
    return redemption;
  },
};
