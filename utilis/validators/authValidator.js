import { check } from "express-validator";
import validatorMiddleware from "../../middleware/validatorMiddleware.js";
import User from "../../models/User.js";

// Signup Validator
export const signupValidator = [
  check("firstName")
    .notEmpty().withMessage("First name is required")
    .isLength({ min: 2 }).withMessage("First name too short")
    .isLength({ max: 32 }).withMessage("First name too long"),
  check("lastName")
    .notEmpty().withMessage("Last name is required")
    .isLength({ min: 2 }).withMessage("Last name too short")
    .isLength({ max: 32 }).withMessage("Last name too long"),
  check("email")
    .notEmpty().withMessage("Email required")
    .isEmail().withMessage("Invalid Email address")
    .normalizeEmail()
    .trim()
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error("Email already used");
      }
    }),
  check("password")
    .notEmpty().withMessage("Password required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
   ,
  validatorMiddleware,
];

// Login Validator (unchanged)
export const loginValidator = [
  check("email")
    .notEmpty().withMessage("Email required")
    .isEmail().withMessage("Invalid Email address")
    .normalizeEmail()
    .trim(),
  check("password")
    .notEmpty().withMessage("Password required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  validatorMiddleware,
];
