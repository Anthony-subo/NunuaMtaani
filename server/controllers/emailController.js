const crypto = require("crypto");
const validator = require("validator");
const UserModel = require("../models/users");
const sendEmail = require("../utils/sendEmail");

const getClientUrl = () => process.env.CLIENT_URL || "https://nunua-mtaani.vercel.app";
const generateRawToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// 1. VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedVerificationToken = hashToken(token);

    const user = await UserModel.findOne({
      verificationToken: hashedVerificationToken,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Verification link is invalid or has expired.",
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error.message);
    return res.status(500).json({ status: "error", message: "Verification failed." });
  }
};

// 2. RESEND VERIFICATION EMAIL
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ status: "error", message: "Valid email is required." });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(200).json({
        status: "success",
        message: "If that email exists, a verification link has been sent.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ status: "error", message: "This email is already verified." });
    }

    const rawVerificationToken = generateRawToken();
    user.verificationToken = hashToken(rawVerificationToken);
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.lastVerificationSentAt = new Date();
    await user.save();

    const verificationLink = `${getClientUrl()}/verify-email/${rawVerificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "NunuaMtaani - Verify Your Email",
      html: `<p>Hello ${user.name}, please <a href="${verificationLink}">click here</a> to verify your account.</p>`,
    });

    return res.status(200).json({
      status: "success",
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("RESEND VERIFICATION ERROR:", error.message);
    return res.status(500).json({ status: "error", message: "Could not send verification email." });
  }
};

// 3. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ status: "error", message: "Valid email is required." });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(200).json({
        status: "success",
        message: "If that email is registered, a password reset link has been sent.",
      });
    }

    const rawResetToken = generateRawToken();
    user.resetPasswordToken = hashToken(rawResetToken);
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetLink = `${getClientUrl()}/reset-password/${rawResetToken}`;

    await sendEmail({
      to: user.email,
      subject: "NunuaMtaani - Password Reset Request",
      html: `<p>Hello ${user.name}, reset your password by <a href="${resetLink}">clicking here</a>. Link expires in 1 hour.</p>`,
    });

    return res.status(200).json({
      status: "success",
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error.message);
    return res.status(500).json({ status: "error", message: "Could not process password reset." });
  }
};