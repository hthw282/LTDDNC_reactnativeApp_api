import mongoose from "mongoose";

const notificationUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
    },
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: [true, "notificationId is required"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const notificationUserModel = mongoose.model(
  "NotificationUser",
  notificationUserSchema
);
export default notificationUserModel;