const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const authController = require("../controllers/authController");

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

// Guard checks: Validate handlers before passing to router
if (typeof authController.register !== "function") {
  throw new Error("authController.register is not exported as a function!");
}
if (typeof authController.login !== "function") {
  throw new Error("authController.login is not exported as a function!");
}

router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);

module.exports = router;