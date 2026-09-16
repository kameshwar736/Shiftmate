import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { createSwapRequest } from "../controller/swapController.js";

const router = express.Router();


//http://localhost:5000//api/swaps/  - swap request by employee

router.post(
    "/",
    authMiddleware,
    roleMiddleware("employee"),
    createSwapRequest
);

export default router;