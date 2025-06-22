import bcrypt from 'bcrypt';
import User from "../models/User.js";

// Create User
export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      profileImage,
      vehicle_details,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "First name, last name, email, and password are required" });
    }

    if (vehicle_details?.length > 0) {
      const invalidVehicle = vehicle_details.find(
        (v) => !v.plate_Char || !v.Plate_Num
      );
      if (invalidVehicle) {
        return res.status(400).json({
          error: "Both plate_Char and Plate_Num are required for each vehicle",
        });
      }
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      profileImage,
      vehicle_details,
    });

    res.status(201).json(newUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email or plate number already exists" });
    }
    res.status(500).json({
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Get single user by ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    res.status(500).json({
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Update a user by id
export const updateUser = async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.email,
      profileImage: req.body.profileImage,
      role: req.body.role,
      birthDay: req.body.birthDay,
      vehicle_details: req.body.vehicle_details
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new Error(`No document for this id: ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
};

// Update user password
export const updateUserPassword = async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new Error(`No document for this id: ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
};

// Delete user by id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User deleted successfully",
      deletedUser: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    res.status(500).json({
      error: "Server error",
    });
  }
};

// Check plate number
export const checkPlateNumber = async (req, res) => {
  try {
    const { plate_Char, Plate_Num } = req.body;

    if (!plate_Char || !Plate_Num) {
      return res.status(400).json({
        error: "Both plate_Char and Plate_Num are required",
      });
    }

    const user = await User.findOne({
      "vehicle_details.plate_Char": plate_Char,
      "vehicle_details.Plate_Num": Plate_Num,
    }).select("firstName lastName email password phone vehicle_details");

    if (!user) {
      return res.status(404).json({
        authorized: false,
        message: "Vehicle not registered",
      });
    }

    const matchedVehicle = user.vehicle_details.find(
      (v) => v.plate_Char === plate_Char && v.Plate_Num === Plate_Num
    );

    res.status(200).json({
      authorized: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        profileImage: user.profileImage,
        phone: user.phone,
        birthDay: user.birthDay,
      },
      vehicle: {
        plate_Char: matchedVehicle.plate_Char,
        Plate_Num: matchedVehicle.Plate_Num,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: "Server error during plate verification",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


export const getLoggedUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateLoggedInUser = async (req, res) => {
  try {
    const updates = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      birthDay: req.body.birthDay,
      vehicle_details: req.body.vehicle_details,
      profileImage: req.file ? `/uploads/users/${req.file.filename}` : req.body.profileImage,
    };

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

