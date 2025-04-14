import notificationModel from "../models/notificationModel.js";
import UserModel from "../models/userModel.js";
import notificationUserModel from "../models/notificationUserModel.js";

export const sendNotificationController = async (req, res) => {
    try {
        const { type, message, data, receiver } = req.body;

        const notification = new notificationModel({type, message, data});
        await notification.save();

        await notificationUserModel.create({
            notificationId: notification._id,
            userId: receiver,
        }); // Save the notification for the specific user

        const io = req.app.get('socketio');
        io.to(receiver).emit('new-notification', notification); // Emit the notification to the specific user

        res.status(201).send({
            success: true,
            message: "New notification added successfully",
            notification
        });

        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error adding notification",
            error
        });
    }
}
export const sendNotificationToAllController = async (req, res) => {
    try {
        const { type, message, data } = req.body;
        const notification = new notificationModel({type, message, data});
        await notification.save();

        const users = await UserModel.find({}); // Get all unique receivers

        const links = users.map(user => ({
            notificationId: notification._id,
            userId: user._id,
        })); // Extract user IDs
        await notificationUserModel.insertMany(links); // Save the notification for each user

        const io = req.app.get('socketio');
        users.forEach(user => {
            io.to(user._id.toString()).emit('new-notification', notification); // Emit the notification to each user
        });

        res.status(201).send({
            success: true,
            message: "New notification added successfully",
            notification
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error adding notification",
            error
        });
    }
}
export const getNotificationsByUserController  = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log("Fetching notifications for userId:", userId)

        const notifications = await notificationUserModel
        .find({userId})
        .sort({ receivedAt: -1 })
        .limit(10)
        .populate("notificationId")

        const formatted = notifications.map(notification => ({
            ...notification.notificationId._doc,
            isRead: notification.isRead,
            receivedAt: notification.receivedAt,
        }))

        res.status(200).send({
            success: true,
            message: "Notifications fetched successfully",
            notifications: formatted
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error fetching notifications",
            error
        });
    }
}

export const markNotificationAsReadController = async (req, res) => {
    try {
        const { notificationId, userId } = req.body;

        const notificationUser = await notificationUserModel.findOneAndUpdate(
            { notificationId, userId },
            { isRead: true },
        );

        if (!notificationUser) {
            return res.status(404).send({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Notification marked as read",
            notificationUser
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error marking notification as read",
            error
        });
    }
}