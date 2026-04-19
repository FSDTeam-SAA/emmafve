// modules/user/user.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { userService } from "./user.service";

//: get all users
export const getalluser = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.getAllUsers(req);
  ApiResponse.sendSuccess(res, 200, "User fetched successfully", users, meta);
});

//: get single user
export const getSingleUser = asyncHandler(async (req, res) => {
  const { userId } = req?.params as { userId: string };
  const user = await userService.getUser(userId);
  ApiResponse.sendSuccess(res, 200, "User fetched successfully", user);
});

//: get my profile
export const getmyprofile = asyncHandler(async (req, res) => {
  const user = await userService.getmyprofile(req);
  ApiResponse.sendSuccess(res, 200, "Profile data fetched successfully", user);
});

//: update user also profile image
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.updateUser(req);
  ApiResponse.sendSuccess(res, 200, "User updated successfully", {
    email: result.email,
    firstName: result.firstName,
    lastName: result.lastName,
    phone: result.phone,
    address: result.address,
    company: result.company,
    profileImage: result.profileImage,
  });
});

//: update user status by id
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.updateStatus(req);
  ApiResponse.sendSuccess(res, 200, "User status updated successfully", result);
});

//: approve partner
export const approvePartner = asyncHandler(async (req: Request, res: Response) => {
  const { partnerId } = req?.params as { partnerId: string };
  const result = await userService.approvePartner(partnerId);
  ApiResponse.sendSuccess(res, 200, "Partner approved successfully", result);
});

//: reject partner
export const rejectPartner = asyncHandler(async (req: Request, res: Response) => {
  const { partnerId } = req?.params as { partnerId: string };
  const result = await userService.rejectPartner(partnerId);
  ApiResponse.sendSuccess(res, 200, "Partner rejected successfully", result);
});

//: update password
export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  await userService.updatePassword(req);
  ApiResponse.sendSuccess(
    res,
    200,
    "Password changed successfully. Please login again."
  );
});

//: update fcm token
export const updateFcmToken = asyncHandler(async (req: Request, res: Response) => {
  await userService.updateFcmToken(req);
  ApiResponse.sendSuccess(res, 200, "FCM Token registered successfully");
});