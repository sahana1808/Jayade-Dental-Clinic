const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// ------------------ REGISTER ------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (role === "doctor") {
      return res.status(403).json({ success: false, message: "Doctors can only be added by Admin." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });

    await newUser.save();
    res.json({ success: true, message: `${role} registered successfully!` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ------------------ LOGIN ------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ success: false, message: "Invalid Email or Role" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid Password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login Successful",
      token,
      role: user.role,
      name: user.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ------------------ FORGOT PASSWORD - SEND OTP ------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    console.log("Your OTP:", otp); // For now, OTP is logged to console

    res.json({ success: true, message: "OTP sent to your email (check console for now)" });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server Error" });
  }
});

// ------------------ RESET PASSWORD ------------------
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (!user.resetOtp || user.resetOtpExpiry < Date.now()) {
      return res.json({ success: false, message: "OTP expired. Try again" });
    }

    if (user.resetOtp != otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;

    await user.save();
    res.json({ success: true, message: "Password reset successfully!" });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server Error" });
  }
});
router.get("/feedback/all", async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 });

    res.json({ success: true, feedbacks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to load feedback" });
  }
});


module.exports = router;
