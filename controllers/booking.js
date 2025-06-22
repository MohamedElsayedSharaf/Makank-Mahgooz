import Booking from "../models/Booking.js";
import Garage from "../models/Garage.js";
import User from "../models/User.js";

// 🧠 Release expired bookings before new ones
const releaseExpiredSpots = async () => {
  const now = new Date();
  const expiredBookings = await Booking.find({ endTime: { $lt: now } });
  if (!expiredBookings.length) return;

  const garage = await Garage.findOne();
  if (!garage) return;

  for (const booking of expiredBookings) {
    const spot = garage.spots.find((s) => s.spotId === booking.spotId);
    if (spot) {
      spot.isOccupied = false;
    }
  }

  await garage.save();
  await Booking.deleteMany({ endTime: { $lt: now } });
};

// 📌 Create booking
export const createBooking = async (req, res) => {
  try {
    const { plate_Char, Plate_Num, spotId, startTime, endTime } = req.body;

    if (!plate_Char || !Plate_Num || !spotId || !startTime || !endTime) {
      return res.status(400).json({ error: "All fields are required" });
    }

    await releaseExpiredSpots(); // Free expired spots first

    // 👤 Get authenticated user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // 🔍 Check if this vehicle is already registered under any user
    const existingVehicleUser = await User.findOne({
      "vehicle_details.plate_Char": plate_Char,
      "vehicle_details.Plate_Num": Plate_Num,
    });

    if (!existingVehicleUser) {
      // ➕ Add vehicle to current user
      user.vehicle_details.push({ plate_Char, Plate_Num });
      await user.save();
    }

    const garage = await Garage.findOne();
    if (!garage) {
      return res.status(500).json({ error: "Garage not initialized" });
    }

    const spot = garage.spots.find((s) => s.spotId === spotId);
    if (!spot) {
      return res.status(404).json({ error: "Spot not found" });
    }

    // ❌ Check overlapping
    const overlapping = await Booking.findOne({
      spotId,
      $or: [
        { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ error: "Spot already booked during this time" });
    }

    // ✅ Book
    const newBooking = await Booking.create({
      user: user._id,
      plate_Char,
      Plate_Num,
      spotId,
      startTime,
      endTime,
    });

    // 🚗 Update spot status
    spot.isOccupied = true;
    await garage.save();

    res.status(201).json({ booking: newBooking });
  } catch (err) {
    res.status(500).json({
      error: "Failed to create booking",
      details: err.message,
    });
  }
};



// 📦 Get all bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user", "name email");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// 📂 Get available spots
export const getAvailableSpots = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const allSpots = Array.from({ length: 16 }, (_, i) => i + 1);

    const booked = await Booking.find({
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
      ],
    }).select("spotId");

    const bookedIds = booked.map((b) => b.spotId);
    const available = allSpots.filter((id) => !bookedIds.includes(id));

    res.status(200).json({ available });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// ❌ Cancel booking
export const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const garage = await Garage.findOne();
    if (!garage) {
      return res.status(500).json({ error: "Garage not initialized" });
    }

    const spot = garage.spots.find((s) => s.spotId === booking.spotId);
    if (spot) {
      spot.isOccupied = false;
      await garage.save();
    }

    res.status(200).json({ message: "Booking cancelled and spot freed", booking });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel booking", details: err.message });
  }
};
