import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        },

        shiftType: {
            type: String,
            enum: ["morning", "evening", "night"],
            required: true
        },

        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled"],
            default: "scheduled"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Shift = mongoose.model("Shift", shiftSchema);

export default Shift;