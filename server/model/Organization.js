import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        industry: {
            type: String,
            enum: [
                "restaurant",
                "hospital",
                "security",
                "retail",
                "other"
            ]
        },

        address: {
            type: String
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

const Organization = mongoose.model(
    "Organization",
    organizationSchema
);

export default Organization;