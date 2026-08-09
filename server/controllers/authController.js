const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const crypto = require("crypto");

const UserModel = require("../models/users");
const sendEmail = require("../utils/sendEmail");

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

const DUMMY_HASH =
  "$2b$10$e7V9/Gk5dD3yqP1pT6mZuu.f3Z4l/D3V9k2g6.2y0/2M0g6.2y0/2";

const getClientUrl = () => process.env.CLIENT_URL || "https://nunua-mtaani.vercel.app";
const generateRawToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// =====================
// HANDLERS
// =====================

const register = async (req, res) => {
  try {
    const { name, phone, email, location, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: "error", message: "Please fill all required fields." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ status: "error", message: "Invalid email address." });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        status: "error",
        message: "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ status: "error", message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const rawVerificationToken = generateRawToken();
    const hashedVerificationToken = hashToken(rawVerificationToken);

    const newUser = await UserModel.create({
      name,
      phone,
      email: normalizedEmail,
      location,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken: hashedVerificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastVerificationSentAt: new Date(),
    });

    const token = generateToken(newUser);
    const verificationLink = `${getClientUrl()}/verify-email/${rawVerificationToken}`;

    try {
      await sendEmail({
        to: newUser.email,
        subject: "Welcome to NunuaMtaani - Verify Your Email",
        html: `
          <div style="font-family:Arial,sans-serif;padding:25px;color:#333">
            <h2>Welcome to NunuaMtaani, ${newUser.name}!</h2>
            <p>Your account has been created successfully. Please verify your email to get started.</p>
            <a href="${verificationLink}" style="background:#0d6efd;color:white;padding:12px 20px;text-decoration:none;border-radius:5px;display:inline-block;margin:15px 0;font-weight:bold;">Verify Email Address</a>
            <p style="color:#666;font-size:12px">This link will expire in 24 hours.</p>
          </div>
        `,
      });

      const userObj = newUser.toObject();
      delete userObj.password;
      delete userObj.verificationToken;

      return res.status(201).json({
        status: "success",
        token,
        user: userObj,
        message: "Registration successful. Please check your email to verify your account.",
      });
    } catch (emailError) {
      console.error("❌ Email Delivery Failed:", emailError.message);
      const userObj = newUser.toObject();
      delete userObj.password;
      delete userObj.verificationToken;

      return res.status(201).json({
        status: "warning",
        token,
        user: userObj,
        message: "Account created! However, we couldn't send the verification email. Please click 'Resend Verification' on the login screen.",
      });
    }
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ status: "error", message: "Email already exists." });
    }
    console.error("REGISTER ERROR:", err.message);
    return res.status(500).json({ status: "error", message: "An internal server error occurred." });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ status: "error", message: "Verification token is required." });
    }

    const hashedToken = hashToken(token);
    const user = await UserModel.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ status: "error", message: "Verification link is invalid or has expired." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return res.status(200).json({ status: "success", message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error.message);
    return res.status(500).json({ status: "error", message: "Email verification failed." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and password are required." });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    const targetPasswordHash = user ? user.password : DUMMY_HASH;
    const match = await bcrypt.compare(password, targetPasswordHash);

    if (!user) {
      return res.status(401).json({ status: "error", message: "Invalid email or password." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ status: "error", message: "This account has been suspended." });
    }

    if (user.status === "deleted") {
      return res.status(403).json({ status: "error", message: "This account no longer exists." });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        status: "error",
        message: "Account temporarily locked due to too many failed login attempts. Please try again later.",
      });
    }

    if (!match) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      return res.status(401).json({ status: "error", message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        status: "error",
        message: "Please verify your email before logging in. Check your inbox or request a new verification email.",
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    const userData = user.toObject();
    delete userData.password;
    delete userData.verificationToken;
    delete userData.resetPasswordToken;

    return res.status(200).json({ status: "success", token, user: userData, message: "Login successful." });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    return res.status(500).json({ status: "error", message: "Login failed." });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ status: "error", message: "Please provide a valid email address." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });
    const genericSuccessMsg = "If an unverified account exists with that email, a verification link has been sent.";

    if (!user || user.isVerified) {
      return res.status(200).json({ status: "success", message: genericSuccessMsg });
    }

    const RESEND_COOLDOWN_MS = 2 * 60 * 1000;
    if (
      user.lastVerificationSentAt &&
      Date.now() - new Date(user.lastVerificationSentAt).getTime() < RESEND_COOLDOWN_MS
    ) {
      return res.status(429).json({
        status: "error",
        message: "Please wait a couple of minutes before requesting another verification email.",
      });
    }

    const rawToken = generateRawToken();
    const hashedVerificationToken = hashToken(rawToken);

    user.verificationToken = hashedVerificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.lastVerificationSentAt = new Date();
    await user.save();

    const verificationLink = `${getClientUrl()}/verify-email/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your NunuaMtaani Account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #333;">
          <h2>Hello ${user.name || "Customer"},</h2>
          <p>You requested a new verification link for your NunuaMtaani account.</p>
          <div style="margin: 25px 0;">
            <a href="${verificationLink}" style="background-color: #0d6efd; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
          </div>
          <p style="color: #666; font-size: 0.9em;">This link is valid for 24 hours.</p>
        </div>
      `,
    });

    return res.status(200).json({ status: "success", message: genericSuccessMsg });
  } catch (err) {
    console.error("RESEND VERIFICATION ERROR:", err);
    return res.status(500).json({ status: "error", message: "Unable to process request at this time." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ status: "error", message: "Please provide a valid email address." });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(200).json({
        status: "success",
        message: "If an account exists with this email, a reset link has been sent.",
      });
    }

    const rawResetToken = generateRawToken();
    const hashedResetToken = hashToken(rawResetToken);

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetLink = `${getClientUrl()}/reset-password/${rawResetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your NunuaMtaani Password",
      html: `
        <div style="font-family:Arial,sans-serif;padding:30px;color:#333">
          <h2>Password Reset</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your password.</p>
          <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#0d6efd;color:#fff;text-decoration:none;border-radius:5px;font-weight:bold;">Reset Password</a>
          <p style="margin-top:20px">This link expires in 1 hour.</p>
        </div>
      `,
    });

    return res.status(200).json({
      status: "success",
      message: "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error.message);
    return res.status(500).json({ status: "error", message: "Unable to process request." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ status: "error", message: "Password is required." });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        status: "error",
        message: "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character.",
      });
    }

    const hashedResetToken = hashToken(token);
    const user = await UserModel.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ status: "error", message: "Password reset link is invalid or has expired." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    return res.status(200).json({ status: "success", message: "Password has been reset successfully. You can now log in." });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error.message);
    return res.status(500).json({ status: "error", message: "Unable to reset password." });
  }
};

// Explicit Module Export
module.exports = {
  register,
  verifyEmail,
  login,
  resendVerification,
  forgotPassword,
  resetPassword,
};