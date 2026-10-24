import Notification from "../model/Notification.js";
import Shift from "../model/Shift.js";
import SwapRequest from "../model/SwapRequest.js";
import User from "../model/User.js";
import { hasShiftOverlap } from "./shiftController.js";

export const createSwapRequest = async (req, res) => {
    try {
        const {
            shiftId,
            targetEmployeeId,
            reason
        } = req.body;

        if (!shiftId || !targetEmployeeId || !reason) {
            return res.status(400).json({
                message: "Shift, target employee and reason are required"
            });
        }

        // Check shift exists
        const shift = await Shift.findById(shiftId);

        if (!shift) {
            return res.status(404).json({
                message: "Shift not found"
            });
        }

        // Make sure the shift belongs to the logged-in employee
        if (shift.employeeId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only request a swap for your own shift"
            });
        }

        // Check target employee exists
        const targetEmployee = await User.findOne({
            _id: targetEmployeeId,
            role: "employee",
            isActive: true
        });

        if (!targetEmployee) {
            return res.status(404).json({
                message: "Target employee not found or inactive"
            });
        }

        // Prevent swapping with yourself
        if (targetEmployeeId === req.user._id.toString()) {
            return res.status(400).json({
                message: "You cannot request a swap with yourself"
            });
        }

        // Check duplicate pending request
        const existingRequest = await SwapRequest.findOne({
            shiftId,
            requesterId: req.user._id,
            targetEmployeeId,
            status: {
                $in: ["pending_employee", "pending_manager"]
            }
        });

        if (existingRequest) {
            return res.status(409).json({
                message: "A swap request already exists"
            });
        }

        const swapRequest = await SwapRequest.create({
            shiftId,
            requesterId: req.user._id,
            targetEmployeeId,
            reason
        });

        // Create notification
        // Notify target employee about the swap request
        try {
            await Notification.create({
                userId: targetEmployee._id,
                message: `${req.user.name} has requested a swap for their ${shift.shiftType} shift on ${new Date(
                    shift.date
                ).toLocaleDateString("en-IN")}.`,
                type: "swap_requested",
                relatedId: swapRequest._id
            });
        } catch (notificationError) {
            console.error("Swap notification creation failed:", notificationError);
        }


        return  res.status(201).json({
            message: "Swap request created successfully",
            swapRequest
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};




export const getIncomingSwapRequests = async (req, res) => {
    try {
        const requests = await SwapRequest.find({
            targetEmployeeId: req.user._id,
            status: "pending_employee"
        })
            .populate("requesterId", "name email")
            .populate("targetEmployeeId", "name email")
            .populate("shiftId");

        res.status(200).json({
            message: "Incoming swap requests fetched successfully",
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};



export const respondToSwapRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        if (!["accept", "reject"].includes(action)) {
            return res.status(400).json({
                message: "Action must be accept or reject"
            });
        }

        const swapRequest = await SwapRequest.findOne({
            _id: id,
            targetEmployeeId: req.user._id,
            status: "pending_employee"
        });

        if (!swapRequest) {
            return res.status(404).json({
                message: "Pending swap request not found"
            });
        }

        if (action === "accept") {
            swapRequest.status = "pending_manager";
        } else {
            swapRequest.status = "rejected";
        }

        await swapRequest.save();

        // Notify the original requester
        try {
            await Notification.create({
                userId: swapRequest.requesterId,
                message: action === "accept"
                    ? `${req.user.name} accepted your shift swap request. It is awaiting manager approval.`
                    : `${req.user.name} rejected your shift swap request.`,
                type: "swap_response",
                relatedId: swapRequest._id
            });
        } catch (notificationError) {
            console.error(
                "Swap response notification failed:",
                notificationError
            );
        }

        return res.status(200).json({
            message: action === "accept"
                ? "Swap request accepted and sent to manager"
                : "Swap request rejected",
            swapRequest
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};



export const getPendingManagerSwapRequests = async (req, res) => {
    try {
        const requests = await SwapRequest.find({
            status: "pending_manager"
        })
            .populate("requesterId", "name email")
            .populate("targetEmployeeId", "name email")
            .populate("shiftId");

        res.status(200).json({
            message: "Pending manager swap requests fetched successfully",
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



export const managerRespondToSwapRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        if (!["approve", "reject"].includes(action)) {
            return res.status(400).json({
                message: "Action must be approve or reject"
            });
        }

        const swapRequest = await SwapRequest.findOne({
            _id: id,
            status: "pending_manager"
        });

        if (!swapRequest) {
            return res.status(404).json({
                message: "Pending manager swap request not found"
            });
        }

        const shift = await Shift.findById(swapRequest.shiftId);

        if (!shift) {
            return res.status(404).json({
                message: "Shift not found"
            });
        }

        if (action === "approve") {
            const targetEmployee = await User.findOne({
                _id: swapRequest.targetEmployeeId,
                role: "employee",
                isActive: true
            });

            if (!targetEmployee) {
                return res.status(400).json({
                    message:
                        "Cannot approve swap: target employee is inactive or invalid."
                });
            }

            // Confirm the shift still belongs to the requester
            if (
                shift.employeeId.toString() !==
                swapRequest.requesterId.toString()
            ) {
                return res.status(409).json({
                    message: "Shift assignment has changed. Cannot approve."
                });
            }

            // Check for overlapping shifts for the target employee
            const overlapCheck = await hasShiftOverlap({
                employeeId: swapRequest.targetEmployeeId,
                date: shift.date,
                startTime: shift.startTime,
                endTime: shift.endTime,
                excludeShiftId: shift._id
            });

            if (overlapCheck.invalidTime) {
                return res.status(400).json({
                    message: "Shift has an invalid date or time."
                });
            }

            if (overlapCheck.overlaps) {
                return res.status(409).json({
                    message:
                        "Cannot approve swap: target employee has an overlapping scheduled shift."
                });
            }

            // Reassign the shift
            shift.employeeId = swapRequest.targetEmployeeId;
            await shift.save();

            swapRequest.status = "approved";
        } else {
            swapRequest.status = "rejected";
        }

        swapRequest.managerId = req.user._id;
        await swapRequest.save();

        // Notify both employees
        try {
            const message = action === "approve"
                ? "The manager approved the shift swap. The shift has been reassigned."
                : "The manager rejected the shift swap request.";

            await Notification.insertMany([
                {
                    userId: swapRequest.requesterId,
                    message,
                    type: action === "approve"
                        ? "swap_approved"
                        : "swap_rejected",
                    relatedId: swapRequest._id
                },
                {
                    userId: swapRequest.targetEmployeeId,
                    message,
                    type: action === "approve"
                        ? "swap_approved"
                        : "swap_rejected",
                    relatedId: swapRequest._id
                }
            ]);
        } catch (notificationError) {
            console.error(
                "Manager decision notification failed:",
                notificationError
            );
        }

        return res.status(200).json({
            message:
                action === "approve"
                    ? "Swap request approved and shift reassigned successfully"
                    : "Swap request rejected successfully",
            swapRequest
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};




export const getMySwapRequests = async (req, res) => {
    try {
        const requests = await SwapRequest.find({
            requesterId: req.user._id
        })
            .populate("requesterId", "name email")
            .populate("targetEmployeeId", "name email")
            .populate("shiftId")
            .populate("managerId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Your swap request history fetched successfully",
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


export const getReceivedSwapRequestHistory = async (req, res) => {
    try {
        const requests = await SwapRequest.find({
            targetEmployeeId: req.user._id
        })
            .populate("requesterId", "name email")
            .populate("targetEmployeeId", "name email")
            .populate("shiftId")
            .populate("managerId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Received swap request history fetched successfully",
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

