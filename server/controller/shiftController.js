import Notification from "../model/Notification.js";
import Shift from "../model/Shift.js";
import User from "../model/User.js";



export const hasShiftOverlap = async ({
    employeeId,
    date,
    startTime,
    endTime,
    excludeShiftId
}) => {
    const start = startTime.split(":").map(Number);
    const end = endTime.split(":").map(Number);

    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];

    if (
        startMinutes >= endMinutes ||
        start.some(Number.isNaN) ||
        end.some(Number.isNaN) ||
        start.length !== 2 ||
        end.length !== 2 ||
        start[0] > 23 ||
        end[0] > 23 ||
        start[1] > 59 ||
        end[1] > 59
    ) {
        return { invalidTime: true };
    }

    const shiftDate = new Date(date);

    if (Number.isNaN(shiftDate.getTime())) {
        return { invalidTime: true };
    }

    const dayStart = new Date(shiftDate);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const query = {
        employeeId,
        date: { $gte: dayStart, $lt: dayEnd },
        status: "scheduled"
    };

    if (excludeShiftId) {
        query._id = { $ne: excludeShiftId };
    }

    const existingShifts = await Shift.find(query);

    const overlaps = existingShifts.some((shift) => {
        const existingStart = shift.startTime.split(":").map(Number);
        const existingEnd = shift.endTime.split(":").map(Number);

        const existingStartMinutes =
            existingStart[0] * 60 + existingStart[1];

        const existingEndMinutes =
            existingEnd[0] * 60 + existingEnd[1];

        return (
            startMinutes < existingEndMinutes &&
            endMinutes > existingStartMinutes
        );
    });

    return { overlaps };
};




export const createShift = async (req, res) => {
    try {
        const {
            employeeId,
            date,
            startTime,
            endTime,
            shiftType
        } = req.body;

        // Validate required fields
        if (
            !employeeId ||
            !date ||
            !startTime ||
            !endTime ||
            !shiftType
        ) {
            return res.status(400).json({
                message: "All shift fields are required"
            });
        }

        // Validate employee
        const employee = await User.findOne({
            _id: employeeId,
            role: "employee",
            isActive: true
        });

        if (!employee) {
            return res.status(400).json({
                message: "Cannot assign shift to an inactive or invalid employee."
            });
        }

        // Check overlapping shifts
        const overlapCheck = await hasShiftOverlap({
            employeeId,
            date,
            startTime,
            endTime
        });

        if (overlapCheck.invalidTime) {
            return res.status(400).json({
                message: "Invalid date or time. End time must be after start time."
            });
        }

        if (overlapCheck.overlaps) {
            return res.status(409).json({
                message: "This employee already has an overlapping scheduled shift."
            });
        }

        // Create shift
        const shift = await Shift.create({
            employeeId,
            date,
            startTime,
            endTime,
            shiftType,
            createdBy: req.user._id
        });

        // Create notification
        try {
            await Notification.create({
                userId: shift.employeeId,
                message: `You have been assigned a ${shift.shiftType} shift on ${new Date(
                    shift.date
                ).toLocaleDateString("en-IN")}.`,
                type: "shift_assigned",
                relatedId: shift._id
            });
        } catch (notificationError) {
            // Do not fail shift creation if notification fails
            console.error("Notification creation failed:", notificationError);
        }

        // Send response after attempting notification creation
        return res.status(201).json({
            message: "Shift created successfully",
            shift
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getAllShifts = async (req, res) => {
    try {
        const shifts = await Shift.find()
            .populate("employeeId", "name email role")
            .populate("createdBy", "name email");

        res.status(200).json({
            message: "Shifts fetched successfully",
            count: shifts.length,
            shifts
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};



export const getMyShifts = async (req, res) => {
    try {
        const shifts = await Shift.find({
            employeeId: req.user._id
        })
            .populate("createdBy", "name email")
            .sort({ date: 1 });

        res.status(200).json({
            message: "My shifts fetched successfully",
            count: shifts.length,
            shifts
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};



export const updateShift = async (req, res) => {
    try {
        const { id } = req.params;

        const shift = await Shift.findById(id);

        if (!shift) {
            return res.status(404).json({
                message: "Shift not found"
            });
        }

    
        // Use existing values when fields are omitted
        const employeeId = req.body.employeeId ?? shift.employeeId;
        const date = req.body.date ?? shift.date;
        const startTime = req.body.startTime ?? shift.startTime;
        const endTime = req.body.endTime ?? shift.endTime;


        const employee = await User.findOne({
            _id: employeeId,
            role: "employee",
            isActive: true
        });

        if (!employee) {
            return res.status(400).json({
                message: "Cannot assign shift to an inactive or invalid employee."
            });
        }


        // Check for overlapping shifts
        const overlapCheck = await hasShiftOverlap({
            employeeId,
            date,
            startTime,
            endTime,
            excludeShiftId: shift._id
        });

        if (overlapCheck.invalidTime) {
            return res.status(400).json({
                message: "Invalid date or time. End time must be after start time."
            });
        }

        if (overlapCheck.overlaps) {
            return res.status(409).json({
                message: "This employee already has an overlapping scheduled shift."
            });
        }

        // Update only fields supplied by the client
        const { shiftType, status } = req.body;

        if (req.body.employeeId !== undefined) {
            shift.employeeId = employeeId;
        }

        if (req.body.date !== undefined) {
            shift.date = date;
        }

        if (req.body.startTime !== undefined) {
            shift.startTime = startTime;
        }

        if (req.body.endTime !== undefined) {
            shift.endTime = endTime;
        }

        if (shiftType !== undefined) {
            shift.shiftType = shiftType;
        }

        if (status !== undefined) {
            shift.status = status;
        }

        const updatedShift = await shift.save();

        return res.status(200).json({
            message: "Shift updated successfully",
            shift: updatedShift
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};



export const deleteShift = async (req, res) => {
    try {
        const { id } = req.params;

        const shift = await Shift.findById(id);

        if (!shift) {
            return res.status(404).json({
                message: "Shift not found"
            });
        }

        await Shift.findByIdAndDelete(id);

        res.status(200).json({
            message: "Shift deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


export const getCalendarShifts = async (req, res) => {
    try {
        const { startDate, endDate, employeeId } = req.query;

        // Validate required date parameters
        if (!startDate || !endDate) {
            return res.status(400).json({
                message: "startDate and endDate are required (YYYY-MM-DD)."
            });
        }

        // Require the YYYY-MM-DD format
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;

        if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
            return res.status(400).json({
                message: "Dates must use YYYY-MM-DD format."
            });
        }

        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end = new Date(`${endDate}T00:00:00.000Z`);

        // Reject invalid calendar dates
        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            start.toISOString().slice(0, 10) !== startDate ||
            end.toISOString().slice(0, 10) !== endDate
        ) {
            return res.status(400).json({
                message: "Invalid calendar date."
            });
        }

        if (start > end) {
            return res.status(400).json({
                message: "startDate cannot be after endDate."
            });
        }

        // Include the entire end date
        const endExclusive = new Date(end);
        endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

        const query = {
            date: {
                $gte: start,
                $lt: endExclusive
            }
        };

        // Employees can only see their own shifts
        if (req.user.role === "employee") {
            query.employeeId = req.user._id;
        } else if (employeeId) {
            // Managers may filter by employee
            if (!/^[a-fA-F0-9]{24}$/.test(employeeId)) {
                return res.status(400).json({
                    message: "Invalid employeeId."
                });
            }

            query.employeeId = employeeId;
        }

        const shifts = await Shift.find(query)
            .populate("employeeId", "name email role")
            .populate("createdBy", "name email")
            .sort({ date: 1, startTime: 1 });

        return res.status(200).json({
            message: "Calendar shifts fetched successfully",
            count: shifts.length,
            startDate,
            endDate,
            shifts
        });
    } catch (error) {
        console.error("Calendar shifts error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};
