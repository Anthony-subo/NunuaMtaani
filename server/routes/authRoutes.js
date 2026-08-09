const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// ==========================================
// Rate Limiters Configuration
// ==========================================

// Strict Limiter for Login (5 attempts / 15 mins)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    status: "error",
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// Sensitive Email Operations Limiter (3 requests / 15 mins)
const emailActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    status: "error",
    message: "Too many requests. Please wait 15 minutes before trying again.",
  },
});

// Account Creation Limiter (10 registrations / hour)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    status: "error",
    message: "Too many accounts created from this IP. Please try again in an hour.",
  },
});

// ==========================================
// Authentication Routes
// ==========================================

// Register Account
router.post("/register", registerLimiter, register);

// Login
router.post("/login", loginLimiter, login);

module.exports = router;