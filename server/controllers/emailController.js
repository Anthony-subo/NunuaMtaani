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

// 1. REGISTER
exports.register = async (req, res) => {
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
        message: "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.",
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
        html: `<p>Hello ${newUser.name}, please <a href="${verificationLink}">click here</a> to verify your account.</p>`,
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
        message: "Account created, but verification email failed to send.",
      });
    }
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    return res.status(500).json({ status: "error", message: "An internal server error occurred." });
  }
};

// 2. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and password are required." });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    const targetPasswordHash = user ? user.password : DUMMY_HASH;
    const match = await bcrypt.compare(password, targetPasswordHash);

    if (!user || !match) {
      return res.status(401).json({ status: "error", message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        status: "error",
        message: "Please verify your email before logging in.",
      });
    }

    const token = generateToken(user);
    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      status: "success",
      token,
      user: userData,
      message: "Login successful.",
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    return res.status(500).json({ status: "error", message: "Login failed." });
  }
};

// 3. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ status: "error", message: "Password is required." });
    }

    const hashedResetToken = hashToken(token);
    const user = await UserModel.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ status: "error", message: "Invalid or expired reset token." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error.message);
    return res.status(500).json({ status: "error", message: "Unable to reset password." });
  }
};