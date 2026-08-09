const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const {
  register,
  login,
  resetPassword,
} = require("../controllers/authController");

// limiters...

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/reset-password/:token", emailActionLimiter, resetPassword);


module.exports = router;