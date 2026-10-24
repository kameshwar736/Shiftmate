
import Notification from "../model/Notification.js";

// Get logged-in user's notifications
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            count: notifications.length,
            notifications
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id
            },
            { isRead: true },
            { new: true, runValidators: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};

// Mark all logged-in user's notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            {
                userId: req.user._id,
                isRead: false
            },
            { isRead: true }
        );

        return res.status(200).json({
            message: "All notifications marked as read",
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};
