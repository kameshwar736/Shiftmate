import Shift from "../model/Shift.js";


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

        // Create shift
        const shift = await Shift.create({
            employeeId,
            date,
            startTime,
            endTime,
            shiftType,
            createdBy: req.user._id
        });

        res.status(201).json({
            message: "Shift created successfully",
            shift
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
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

        const {
            employeeId,
            date,
            startTime,
            endTime,
            shiftType,
            status
        } = req.body;

        const shift = await Shift.findById(id);

        if (!shift) {
            return res.status(404).json({
                message: "Shift not found"
            });
        }

        // Update only provided fields
        if (employeeId) shift.employeeId = employeeId;
        if (date) shift.date = date;
        if (startTime) shift.startTime = startTime;
        if (endTime) shift.endTime = endTime;
        if (shiftType) shift.shiftType = shiftType;
        if (status) shift.status = status;

        const updatedShift = await shift.save();

        res.status(200).json({
            message: "Shift updated successfully",
            shift: updatedShift
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
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

