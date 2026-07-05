const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["buyer", "seller", "admin", "rider"],
      default: "buyer",
    },

    password: {
      type: String,
      required: true,
    },

    // ==========================
    // Email Verification
    // ==========================
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    verificationTokenExpires: {
      type: Date,
      default: null,
    },

    // ==========================
    // Password Reset
    // ==========================
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    // ==========================
    // Security
    // ==========================
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", UserSchema);