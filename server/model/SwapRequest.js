import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema(
    {
        shiftId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shift",
            required: true
        },

        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        targetEmployeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        reason: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "pending_employee",
                "pending_manager",
                "approved",
                "rejected"
            ],
            default: "pending_employee"
        },

        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

const SwapRequest = mongoose.model(
    "SwapRequest",
    swapRequestSchema
);

export default SwapRequest;