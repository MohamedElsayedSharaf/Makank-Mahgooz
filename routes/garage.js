// routes/garage.js
import express from "express";
import {
  createGarage,
  getGarage,
  updateSpotAvailability,
} from "../controllers/garage.js";

const router = express.Router();

router.post("/", createGarage); // Create garage with 16 spots
router.get("/", getGarage);     // Get garage details
router.put("/spot", updateSpotAvailability); // Update a spot's availability

export default router;
