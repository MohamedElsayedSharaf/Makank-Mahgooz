// controllers/garage.js
import Garage from "../models/Garage.js";

// Create garage with 16 spots
export const createGarage = async (req, res) => {
  try {
    const spots = [];
    for (let i = 1; i <= 16; i++) {
      spots.push({ spotId: i });
    }
cd
    const garage = await Garage.create({ spots });
    res.status(201).json(garage);
  } catch (err) {
    res.status(500).json({ error: "Failed to create garage", details: err.message });
  }
};

// Get garage info
export const getGarage = async (req, res) => {
  try {
    const garage = await Garage.findOne();
    if (!garage) return res.status(404).json({ error: "Garage not found" });

    res.status(200).json(garage);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Update a spot availability manually (optional admin)
export const updateSpotAvailability = async (req, res) => {
  try {
    const { spotId, isAvailable } = req.body;

    const garage = await Garage.findOne();
    if (!garage) return res.status(404).json({ error: "Garage not found" });

    const spot = garage.spots.find((s) => s.spotId === spotId);
    if (!spot) return res.status(404).json({ error: "Spot not found" });

    spot.isAvailable = isAvailable;
    await garage.save();

    res.status(200).json({ message: "Spot updated", spot });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
