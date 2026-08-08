const validator = require("validator");
const crypto = require("crypto");

const UserModel = require("../models/users");
const sendEmail = require("../utils/sendEmail");

const getClientUrl = () => process.env.CLIENT_URL || "https://nunua-mtaani.vercel.app";
const generateRawToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// =====================
// VERIFY EMAIL
// =====================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Verification token is required.",
      });
    }

    const hashedToken = hashToken(token);

    const user = await UserModel.findOne({
      verificationToken: hashedToken,
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
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Email verification failed.",
    });
  }
};

// =====================
// RESEND VERIFICATION
// =====================
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid email address.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    const genericSuccessMsg =
      "If an unverified account exists with that email, a verification link has been sent.";

    if (!user || user.isVerified) {
      return res.status(200).json({
        status: "success",
        message: genericSuccessMsg,
      });
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

    return res.status(200).json({
      status: "success",
      message: genericSuccessMsg,
    });
  } catch (err) {
    console.error("RESEND VERIFICATION ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: "Unable to process request at this time.",
    });
  }
};

// =====================
// FORGOT PASSWORD
// =====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid email address.",
      });
    }

    const user = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    });

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
    return res.status(500).json({
      status: "error",
      message: "Unable to process request.",
    });
  }
};