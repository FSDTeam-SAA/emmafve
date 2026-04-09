// modules/user/user.service.ts
import { userModel } from "./user.models";
import CustomError from "../../helpers/CustomError";
import { deleteCloudinary, uploadCloudinary } from "../../helpers/cloudinary";
import { role, status, UpdateUserPayload } from "./user.interface";
import { paginationHelper } from "../../utils/pagination";

export const userService = {
  //get all users
  async getAllUsers(req: any) {
    const {
      role: roleParam,
      status: statusParam,
      search,
      page: pagebody,
      limit: limitbody,
    } = req.query;

    const { page, limit, skip } = paginationHelper(pagebody, limitbody);

    const filter: any = {};

    const allowedRoles = [...Object.values(role), "all"] as const;

    if (roleParam && !allowedRoles.includes(roleParam)) {
      throw new CustomError(
        400,
        `Invalid role "${roleParam}". Allowed roles: ${allowedRoles.join(", ")}`
      );
    }

    if (!roleParam) {
      filter.role = "user";
    } else if (roleParam !== "all") {
      filter.role = roleParam;
    }

    const allowedStatuses = [...Object.values(status), "all"] as const;

    if (statusParam && !allowedStatuses.includes(statusParam)) {
      throw new CustomError(
        400,
        `Invalid status "${statusParam}". Allowed status: ${allowedStatuses.join(", ")}`
      );
    }

    if (statusParam && statusParam !== "all") {
      filter.status = statusParam;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, totalUsers] = await Promise.all([
      userModel.find(filter).skip(skip).limit(limit).select("-password -passwordResetToken -passwordResetExpire -refreshToken -__v -createdAt -updatedAt -emailVerifiedAt -emailVerifiedOtp -verificationOtp -verificationOtpExpire -isDeleted -deletedAt -rememberMe"),
      userModel.countDocuments(filter),
    ]);

    return {
      users,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        total: totalUsers,
      },
    };
  },

  //get single user
  async getUser(userId: string) {
    const user = await userModel.findOne({ _id: userId }).select("-password -passwordResetToken -passwordResetExpire -refreshToken -__v -createdAt -updatedAt -emailVerifiedAt -emailVerifiedOtp -verificationOtp -verificationOtpExpire -isDeleted -deletedAt -rememberMe ");
    if (!user) throw new CustomError(400, "User not found");
    return user;
  },

  //get my profile
  async getmyprofile(req: any) {
    const { email } = req?.user as { email: string };
    const user = await userModel.findOne({ email: email }).select("-password -passwordResetToken -passwordResetExpire -refreshToken -__v -createdAt -updatedAt -emailVerifiedAt -emailVerifiedOtp -verificationOtp -verificationOtpExpire -isDeleted -deletedAt -rememberMe ");
    if (!user) throw new CustomError(400, "User not found");
    return user;
  },

  //update user
  async updateUser(req: any) {
    const data: UpdateUserPayload = req.body;
    const { email, role } = req?.user as { email: string; role: string };
    const image = req?.file as Express.Multer.File;

    if (data.status) {
      if (role === "admin") {
        if (!Object.values(status).includes(data.status as status)) {
          throw new CustomError(400, "Invalid status");
        }
      } else {
        if (![status.ACTIVE, status.INACTIVE].includes(data.status as status)) {
          throw new CustomError(
            403,
            `You are not allowed to set status to '${data.status}'`
          );
        }
      }
    }

    const user = await userModel.findOneAndUpdate({ email: email }, data, {
      returnDocument: "after",
    });
    if (!user) throw new CustomError(400, "User not found");

    if (image) {
      if (user.profileImage?.public_id) {
        await deleteCloudinary(user.profileImage?.public_id);
      }
      const result = await uploadCloudinary(image?.path);
      user.profileImage = result;
    }

    await user.save();
    return user;
  },

  //update user status by admin 
  async updateStatus(req: any) {
    const { userId } = req?.params as { userId: string };
    const { status: newStatus } = req.body as { status: status };

    const user = await userModel.findOneAndUpdate({ _id: userId }, { status: newStatus }, {
      returnDocument: "after",
    }).select("-password -passwordResetToken -passwordResetExpire -refreshToken -__v -createdAt -updatedAt -emailVerifiedAt -emailVerifiedOtp -verificationOtp -isDeleted");
    if (!user) throw new CustomError(400, "User not found");
    return user;
  },

  //update password
  async updatePassword(req: any) {
    const { email } = req?.user as { email: string };
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };

    const user = await userModel.findOne({ email: email }).select("+password");
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    await user.updatePassword(currentPassword, newPassword);
    await user.save();

    return true;
  },
};
