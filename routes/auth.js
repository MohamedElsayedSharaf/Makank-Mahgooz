import express from "express";
import { loginValidator, signupValidator } from "../utilis/validators/authValidator.js";
import { forgotPassword, login, signup } from "../controllers/auth.js";



const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPassword);

export default router;
