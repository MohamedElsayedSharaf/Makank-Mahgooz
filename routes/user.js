import express from "express";
import {
  createUser,
  getUsers,
  getUser,
  checkPlateNumber,
  deleteUser,
  updateUser,
  updateUserPassword,
  getLoggedUser,
  updateLoggedInUser,
} from "../controllers/user.js";
import {
  createUserValidator,
  getUserValidator,
  updateUserPasswordVaildator,
} from "../utilis/validators/userValidator.js";
import { protect, allowedTo } from "../controllers/auth.js";
import { uploadUserImage } from "../middleware/uploadImg.js";

const router = express.Router();
router.get("/me", protect, getLoggedUser); // Get a user profile
router.put("/me", protect, uploadUserImage, updateLoggedInUser); // Update user profile

router.post("/", protect, allowedTo("admin"), createUserValidator, createUser); // Create user
router.get("/", getUsers); // Get all users
router.get("/:id", getUserValidator, getUser); // Get a user by ID
router.put("/:id", protect, allowedTo("admin"), updateUser); // Get a user by ID

router.put(
  "/changePassword/:id",
  updateUserPasswordVaildator,
  updateUserPassword
); // Update user
router.delete("/:id", deleteUser); // Delete a user by ID
router.post("/check-plate", checkPlateNumber); // New route to check plate

export default router;
