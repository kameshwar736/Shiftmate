import express from "express";

import { createShift, deleteShift, getAllShifts, getMyShifts, updateShift } from "../controller/shiftController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// http://localhost:5000/api/shifts    -create shift
router.post(
    "/",
    authMiddleware,
    roleMiddleware("manager"),
    createShift
);

// http://localhost:5000/api/shifts    -get all shift
router.get(
    "/",
    authMiddleware,
    roleMiddleware("manager"),
    getAllShifts
);

// http://localhost:5000/api/shifts/my    -get emp shift
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("employee"),
    getMyShifts
);

// http://localhost:5000/api/shifts/:id   -update shift
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("manager"),
    updateShift
);

// http://localhost:5000/api/shifts/:id   -delete shift
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("manager"),
    deleteShift
);





export default router;