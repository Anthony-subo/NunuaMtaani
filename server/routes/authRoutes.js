const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const authController = require("../controllers/authController");

// ==========================================
// Rate Limiters Configuration
// ==========================================

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
// Auth Routes
// ==========================================

router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);

module.exports = router;