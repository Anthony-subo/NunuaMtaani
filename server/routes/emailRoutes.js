const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const emailController = require("../controllers/emailController");
const authController = require("../controllers/authController");

// ==========================================
// Rate Limiters Configuration
// ==========================================

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

// ==========================================
// Email & Password Management Routes
// ==========================================

// Email Verification
router.get("/verify-email/:token", emailController.verifyEmail);
router.post("/resend-verification", emailActionLimiter, emailController.resendVerification);

// Password Management
router.post("/forgot-password", emailActionLimiter, emailController.forgotPassword);
router.post("/reset-password/:token", emailActionLimiter, authController.resetPassword);

module.exports = router;