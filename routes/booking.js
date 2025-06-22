  import express from "express";
  import {
    createBooking,
    getBookings,
    getAvailableSpots,
    deleteBooking,
  } from "../controllers/booking.js";
import { protect } from "../controllers/auth.js";

  const router = express.Router();

  router.post("/", protect ,createBooking); // Create booking
  router.get("/", getBookings); // List all bookings
  router.post("/available", getAvailableSpots); // Check available spots
  router.delete("/:id", deleteBooking); // Cancel a booking

  export default router;
  