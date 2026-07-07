const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const {
  register,
  login,
  verifyEmail,
} = require("../controllers/authController");

// ==========================
// Login Rate Limiter
// ==========================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// ==========================
// Authentication Routes
// ==========================

// Register
router.post("/register", register);

// Login (Protected by Rate Limiter)
router.post("/login", loginLimiter, login);

router.get("/verify-email/:token", verifyEmail);

router.post("/resend-verification", resendVerification);

module.exports = router;