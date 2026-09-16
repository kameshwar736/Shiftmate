import express from "express";

import { activateEmployee, deactivateEmployee, getAllEmployees, getEmployeeById, updateEmployee } from "../controller/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

//http://localhost:5000/api/users/employees - view all emp detail

router.get(
    "/employees",
    authMiddleware,
    roleMiddleware("manager"),
    getAllEmployees
);

//http://localhost:5000/api/users/employees/:id  - view employee by id
router.get(
    "/employees/:id",
    authMiddleware,
    roleMiddleware("manager"),
    getEmployeeById
);

//http://localhost:5000/api/users/employees/:id - update employee

router.put(
    "/employees/:id",
    authMiddleware,
    roleMiddleware("manager"),
    updateEmployee
);

//http://localhost:5000/api/users/employees/:id/deactivate  - deactivate employee
router.patch(
    "/employees/:id/deactivate",
    authMiddleware,
    roleMiddleware("manager"),
    deactivateEmployee
);

//http://localhost:5000/api/users/employees/:id/activate  - activate employee

router.patch(
    "/employees/:id/activate",
    authMiddleware,
    roleMiddleware("manager"),
    activateEmployee
);


export default router;