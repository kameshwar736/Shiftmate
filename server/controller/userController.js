import User from "../model/User.js";


export const getAllEmployees = async (req, res) => {
    try {
        const employees = await User.find({ role: "employee" })
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Employees fetched successfully",
            count: employees.length,
            employees
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await User.findOne({
            _id: id,
            role: "employee"
        }).select("-password");

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            message: "Employee fetched successfully",
            employee
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            departmentId,
            isActive
        } = req.body;

        const employee = await User.findOne({
            _id: id,
            role: "employee"
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        if (name) {
            employee.name = name;
        }

        if (departmentId) {
            employee.departmentId = departmentId;
        }

        if (typeof isActive === "boolean") {
            employee.isActive = isActive;
        }

        const updatedEmployee = await employee.save();

        res.status(200).json({
            message: "Employee updated successfully",
            employee: {
                id: updatedEmployee._id,
                name: updatedEmployee.name,
                email: updatedEmployee.email,
                role: updatedEmployee.role,
                departmentId: updatedEmployee.departmentId,
                isActive: updatedEmployee.isActive
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const deactivateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await User.findOne({
            _id: id,
            role: "employee"
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        employee.isActive = false;

        await employee.save();

        res.status(200).json({
            message: "Employee deactivated successfully",
            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                isActive: employee.isActive
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


export const activateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await User.findOne({
            _id: id,
            role: "employee"
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        employee.isActive = true;

        await employee.save();

        res.status(200).json({
            message: "Employee activated successfully",
            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                isActive: employee.isActive
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

