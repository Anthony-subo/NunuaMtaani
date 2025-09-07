// server/controllers/authController.js
const bcrypt = require("bcrypt");
const UserModel = require("../models/users");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

exports.register = async (req, res) => {
  const { name, phone, email, location, password, role } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await UserModel.create({
      name,
      phone,
      email,
      location,
      password: hashedPassword,
      role,
      verificationToken,
      isVerified: false
    });

    // setup mailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${email}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your NunuaMtaani account",
      html: `
        <h2>Welcome to NunuaMtaani, ${name}!</h2>
        <p>Please click below to verify your email:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>If you didn’t request this, ignore the email.</p>
      `
    });

    res.status(201).json({ status: "success", message: "Check your email to verify your account." });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    res.json({ status: "success", user });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err });
  }
};
exports.verifyEmail = async (req, res) => {
  const { email, token } = req.body;

  try {
    const user = await UserModel.findOne({ email, verificationToken: token });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ status: "success", message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err });
  }
};

