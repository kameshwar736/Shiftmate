import express from "express";
import { login, register } from "../controller/authController.js";
import authMiddleware from "../middleware/authMiddleware.js"
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// http://localhost:5000/api/auth/register
router.post("/register", register );

// http://localhost:5000/api/auth/login
router.post("/login", login);

// http://localhost:5000/api/auth/profile   testing api
router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Profile accessed successfully",
        user: req.user
    });
});

// http://localhost:5000/api/auth/employee-test
router.get("/employee-test",authMiddleware,roleMiddleware("employee"),(req, res) => {
        res.json({
            message: "Welcome employyee"
        });
    }
);

export default router;