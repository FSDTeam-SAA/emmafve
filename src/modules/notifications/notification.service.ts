import { Types } from "mongoose";
import { notificationModel } from "./notification.models";
import { userModel } from "../usersAuth/user.models";
import { NotificationType } from "./notification.interface";
import { sendPushNotification } from "../../utils/firebase";
import { getIo } from "../../socket/server";

export const notificationService = {
  async getUserNotifications(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      notificationModel
        .find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      notificationModel.countDocuments({ user: userId }),
    ]);

    const unreadCount = await notificationModel.countDocuments({ user: userId, isRead: false });

    return {
      notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  },

  async markAsRead(userId: string, notificationId: string) {
    return notificationModel.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
  },

  async notifyUsersNearby(title: string, body: string, type: NotificationType, lat?: number, lng?: number, radiusKm: number = 10) {
    try {
      let filter: any = { status: "active" };

      if (lat !== undefined && lng !== undefined) {
        console.log(`[Notification Service] Filtering for active users within ${radiusKm}km of [${lat}, ${lng}], plus all users missing a location...`);
        filter.$or = [
          {
            location: {
              $geoWithin: {
                $centerSphere: [[lng, lat], radiusKm / 6378.1],
              },
            },
          },
          { "location.coordinates": { $exists: false } },
          { "location.coordinates": { $size: 0 } },
          { location: null },
        ];
      } else {
        console.log(`[Notification Service] No event coordinates provided. Broadcasting to ALL active users.`);
      }
      
      const usersNearby = await userModel.find(filter).select("_id fcmTokens");

      console.log(`[Notification Service] Found ${usersNearby.length} target users.`);

      if (!usersNearby.length) {
         console.log(`[Notification Service] Aborting. Reason: No users found within radius. Ensure testing user has a 'location' saved in the DB!`);
         return;
      }

      const notificationsToSave = usersNearby.map(u => ({
        user: u._id,
        title,
        description: body,
        type,
        isRead: false,
      }));

      // 1. Save to database
      const savedNotifications = await notificationModel.insertMany(notificationsToSave);

      // Extract FCM tokens and prepare Socket logic
      const allTokens: string[] = [];
      let io: any; // using any to bypass strict type here easily, or import Server
      try {
        io = getIo();
      } catch (err) {
        // Socket may not be initialized or caught error
      }

      usersNearby.forEach((user, idx) => {
        // Collect tokens
        if (user.fcmTokens && Array.isArray(user.fcmTokens)) {
          allTokens.push(...user.fcmTokens);
        }

        // 2. Real-time emit
        if (io) {
          io.to(user._id.toString()).emit("notification:new", savedNotifications[idx]);
        }
      });

      // 3. Send Push Notifications via FCM (Idled per user request)
      // if (allTokens.length > 0) {
      //   await sendPushNotification(allTokens, title, body, { type });
      // }

    } catch (error) {
      console.error("❌ Failed in notifyUsersNearby:", error);
    }
  },

  async notifySingleUser(userId: string, title: string, body: string, type: NotificationType) {
    try {
      const user = await userModel.findById(userId).select("_id fcmTokens");
      if (!user) return;

      const notificationToSave = {
        user: user._id,
        title,
        description: body,
        type,
        isRead: false,
      };

      const savedNotification = await notificationModel.create(notificationToSave);

      let io: any;
      try {
        io = getIo();
      } catch (err) {}

      if (io) {
        io.to(user._id.toString()).emit("notification:new", savedNotification);
      }

      // Send Push Notifications via FCM (Idled per user request)
      // if (user.fcmTokens && Array.isArray(user.fcmTokens) && user.fcmTokens.length > 0) {
      //   await sendPushNotification(user.fcmTokens, title, body, { type });
      // }

    } catch (error) {
      console.error("❌ Failed in notifySingleUser:", error);
    }
  }
};
