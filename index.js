import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import userRoutes from "./routes/user.js";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/booking.js";
import garageRoutes from "./routes/garage.js";

// import User from "./models/User.js";
// import { userData } from "./data/index.js";

/* CONFIGURATION */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:5000", // Allow requests from your AI service
  })
);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/garage", garageRoutes);

app.use("/uploads/users", express.static("uploads"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server is running on port: ${PORT}`));

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((error) => console.error(`❌ MongoDB connection failed: ${error}`));
