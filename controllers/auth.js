import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utilis/sendEmail.js";

export const signup = async (req, res, next) => {
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      birthDay: req.body.birthDay,
      vehicle_details: req.body.vehicle_details,
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRE_TIME }
    );

    res.status(201).json({ data: user, token });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

export const login = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new Error("Incorrect email or password", 401));
  }
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    }
  );
  res.status(201).json({ data: user, token });
};

export const protect = async (req, res, next) => {
  // 1) Get token
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new Error("Not authorized, no token provided", 401));
  }
  // 2) Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded Token:", decoded); // ✅ Debug
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return res.status(401).json({ message: "User no longer exists." });
    }
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token or expired" });
  }
};

export const allowedTo =
  (...roles) =>
  async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new Error("You are not allowed to use this route", 403));
    }
    next();
  };

export const forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new Error(`There is no user for this email: ${req.body.email}`, 404)
    );
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  user.save();

  const message = `
Hi ${user.name}\n,
Use the code below to reset your password: \n
${resetCode} \n
This code expires in 10 minutes. If you didn’t request it, please ignore this email. \n
— Ecommerce Team
  `;
  await sendEmail({
    email: user.email,
    subject: "Your password reset code is valid for 10 minutes",
    message,
  });
  res.status(200).json({ status: "Success", message: "Reset code is sent" });
};
