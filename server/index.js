import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from "./routes/authRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";

import connectDB from './config/db.js'
import cookieParser from 'cookie-parser';
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config()

const app = express()

app.use(cors())

app.use(express.json())
app.use(cookieParser());

const PORT = process.env.PORT || 3000

connectDB()

// http://localhost:5000

app.use("/api/auth", authRoutes);

app.use("/api/shifts", shiftRoutes);

app.use("/api/users", userRoutes);


app.use("/api/swaps", swapRoutes);

app.use("/api/notifications", notificationRoutes);

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})