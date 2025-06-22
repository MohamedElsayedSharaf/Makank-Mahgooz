import { check, body } from "express-validator";
import bcrypt from "bcrypt";
import validatorMiddleware from "../../middleware/validatorMiddleware.js";
import User from "../../models/User.js";

// GET single user
export const getUserValidator = [
  check("id").isMongoId().withMessage("Invalid mongo id"),
  validatorMiddleware,
];

// CREATE user
export const createUserValidator = [
  check("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name too short")
    .isLength({ max: 32 })
    .withMessage("First name too long"),
  check("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name too short")
    .isLength({ max: 32 })
    .withMessage("Last name too long"),
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
    .trim()
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error("Email already used");
      }
    }),
  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  check("role").optional().isIn(["user", "admin"]).withMessage("Invalid role"),
  check("phone").optional().isMobilePhone().withMessage("Invalid phone number"),
  check("birthDate").optional().isISO8601().withMessage("Invalid birthDate"),
  validatorMiddleware,
];

// UPDATE user
export const updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id"),
  check("firstName")
    .optional()
    .isLength({ min: 2 })
    .withMessage("First name too short"),
  check("lastName")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Last name too short"),
  check("email").optional().isEmail().withMessage("Invalid email"),
  check("birthDate").optional().isISO8601().withMessage("Invalid birthDay"),
  check("phone").optional().isMobilePhone().withMessage("Invalid phone number"),

  validatorMiddleware,
];

// UPDATE user password
export const updateUserPasswordVaildator = [
  check("id").isMongoId().withMessage("Invalid user id"),
  check("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  check("password")
    .notEmpty()
    .withMessage("New password is required")
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("User not found");
      }

      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

      if (!isCorrectPassword) {
        throw new Error("Current password is incorrect");
      }

      if (req.body.currentPassword === val) {
        throw new Error("New password must be different from current password");
      }

      return true;
    }),
  validatorMiddleware,
];

// DELETE user
export const deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id"),
  validatorMiddleware,
];
