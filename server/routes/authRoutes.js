const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const authController = require("../controllers/authController");
const emailController = require("../controllers/emailController"); // If separated

// ==========================================
// Rate Limiters Configuration
// ==========================================

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many accounts created from this IP. Please try again in 15 minutes.",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

const emailActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3, // 3 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests. Please wait 15 minutes before trying again.",
  },
});

// ==========================================
// Auth Routes
// ==========================================

router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);

// Email Verification & Password Reset Routes
router.get("/verify-email/:token", emailController.verifyEmail);
router.post("/resend-verification", emailActionLimiter, emailController.resendVerification);
router.post("/forgot-password", emailActionLimiter, emailController.forgotPassword);
router.post("/reset-password/:token", emailActionLimiter, authController.resetPassword);

module.exports = router;