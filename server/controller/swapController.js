import Shift from "../model/Shift.js";
import SwapRequest from "../model/SwapRequest.js";
import User from "../model/User.js";

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

        res.status(201).json({
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
