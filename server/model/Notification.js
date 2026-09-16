import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                "shift",
                "swap",
                "leave",
                "system"
            ]
        },

        title: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true
        },

        referenceId: {
            type: mongoose.Schema.Types.ObjectId
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);

export default Notification;