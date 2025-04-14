import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "type is required"],
    },
    message: {
      type: String,
      required: [true, "message is required"],
    },
    data: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export const notificationModel = mongoose.model("Notification", notificationSchema);
export default notificationModel;