const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const crypto = require("crypto");

const UserModel = require("../models/users");
const sendEmail = require("../utils/sendEmail");
const generateVerificationToken = require("../utils/generateToken");

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

// =====================
// GENERATE JWT
// =====================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// =====================
// REGISTER
// =====================

exports.register = async (req, res) => {
  try {
    console.log("========== REGISTER ==========");
    console.log("Request Body:", req.body);

    const {
      name,
      phone,
      email,
      location,
      password,
      role,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please fill all required fields.",
      });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email address.",
      });
    }

    // Validate password
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        status: "error",
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.",
      });
    }

    // Check existing account
    const existingUser = await UserModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists.",
      });
    }

    console.log("Hashing password...");

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Generating verification token...");

    const verificationToken = generateVerificationToken();

    console.log("Creating user...");

    const newUser = await UserModel.create({
      name,
      phone,
      email: email.toLowerCase(),
      location,
      password: hashedPassword,
      role,

      isVerified: false,
      verificationToken,
      verificationTokenExpires: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ),
    });

    console.log("User created:", newUser.email);

    // Generate JWT
    const token = generateToken(newUser);

    // Create verification link
    const verificationLink =
      `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    console.log("Verification link:");
    console.log(verificationLink);

    // =====================
    // SEND VERIFICATION EMAIL
    // =====================

    console.log("Sending verification email...");

      await sendEmail({
        to: newUser.email,
      subject: "Verify your NunuaMtaani Account",
        html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            background: #ffffff;
            color: #333333;
          "
        >

          <h2 style="color: #0d6efd;">
            Welcome to NunuaMtaani!
          </h2>

          <p>
            Hello <strong>${newUser.name}</strong>,
          </p>

          <p>
            Thank you for creating your NunuaMtaani account.
          </p>

          <p>
            Please verify your email address by clicking the button below:
          </p>

          <p style="margin: 30px 0;">
            <a
              href="${verificationLink}"
              style="
                display: inline-block;
                padding: 12px 24px;
                background: #0d6efd;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
              "
            >
              Verify My Email
            </a>
          </p>

          <p>
            This verification link will expire in 24 hours.
          </p>

          <p>
            If you did not create this account, you can safely ignore this
            email.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;">

          <p style="font-size: 12px; color: #777777;">
            This email was sent by NunuaMtaani.
          </p>

        </div>
        `,
      });

    console.log("✅ Verification email sent.");

    // Remove password from response
    const user = newUser.toObject();
    delete user.password;

      return res.status(201).json({
        status: "success",
        token,
      user,
      message:
        "Registration successful. Please check your email to verify your account.",
      });
  } catch (err) {
    console.error("========== REGISTER ERROR ==========");
    console.error(err);
    console.error(err.stack);

    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// =====================
// LOGIN
// =====================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found.",
      });
    }

    // Check account status
    if (user.status === "suspended") {
      return res.status(403).json({
        message: "This account has been suspended.",
      });
    }

    if (user.status === "deleted") {
      return res.status(403).json({
        message: "This account no longer exists.",
      });
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Please verify your email before logging in. Check your inbox or request a new verification email.",
      });
    }

    // Check account lock
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        message:
          "Account temporarily locked due to too many failed login attempts. Please try again later.",
      });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await user.save();

      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();

    await user.save();

    // Generate JWT
    const token = generateToken(user);

    // Remove password
    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      status: "success",
      token,
      user: userData,
      message: "Login successful.",
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      message: "Login failed.",
    });
  }
};

// =====================
// VERIFY EMAIL
// =====================

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await UserModel.findOne({
      verificationToken: token,
      verificationTokenExpires: {
        $gt: new Date(),
      },
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
    console.error("VERIFY EMAIL ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Email verification failed.",
    });
  }
};

// =====================
// RESEND VERIFICATION EMAIL
// =====================

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required.",
      });
    }

    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "No account found with this email.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: "error",
        message: "This account is already verified.",
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();

    user.verificationToken = verificationToken;

    user.verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await user.save();

    // Create new verification link
    const verificationLink =
      `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    console.log("Resend verification link:");
    console.log(verificationLink);

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: "Verify your NunuaMtaani Account",
      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            background: #ffffff;
            color: #333333;
          "
        >

          <h2 style="color: #0d6efd;">
            Verify Your NunuaMtaani Account
          </h2>

          <p>
            Hello <strong>${user.name}</strong>,
          </p>

          <p>
            You requested a new verification email for your NunuaMtaani
            account.
            </p>

          <p>
            Click the button below to verify your email address:
          </p>

          <p style="margin: 30px 0;">
              <a
                href="${verificationLink}"
                style="
                display: inline-block;
                padding: 12px 24px;
                background: #0d6efd;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                "
              >
              Verify My Email
              </a>
          </p>

          <p>
            This link will expire in 24 hours.
            </p>

          <p>
            If you did not request this email, you can safely ignore it.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;">

          <p style="font-size: 12px; color: #777777;">
            This email was sent by NunuaMtaani.
          </p>

        </div>
      `,
    });

    console.log("✅ Verification email resent.");

    return res.status(200).json({
      status: "success",
      message: "Verification email sent successfully.",
    });
  } catch (err) {
    console.error("RESEND VERIFICATION ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Unable to send verification email.",
    });
  }
};

// =====================
// FORGOT PASSWORD
// =====================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required.",
      });
    }

    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "No account found with this email.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;

    user.resetPasswordExpires = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await user.save();

    // Create reset link
    const resetLink =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    console.log("Password reset link:");
    console.log(resetLink);

    // Send password reset email
    await sendEmail({
      to: user.email,
      subject: "Reset your NunuaMtaani Password",
      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            background: #ffffff;
            color: #333333;
          "
        >

          <h2 style="color: #0d6efd;">
            Password Reset
          </h2>

          <p>
            Hello <strong>${user.name}</strong>,
          </p>

          <p>
            We received a request to reset your NunuaMtaani password.
          </p>

          <p>
            Click the button below to create a new password:
          </p>

          <p style="margin: 30px 0;">
            <a
              href="${resetLink}"
              style="
                display: inline-block;
                padding: 12px 24px;
                background: #0d6efd;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            This link expires in 1 hour.
          </p>

          <p>
            If you didn't request a password reset, simply ignore this email.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;">

          <p style="font-size: 12px; color: #777777;">
            This email was sent by NunuaMtaani.
          </p>

        </div>
      `,
    });

    console.log("✅ Password reset email sent.");

    return res.status(200).json({
      status: "success",
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to process request.",
    });
  }
};

// =====================
// RESET PASSWORD
// =====================

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Password is required.",
      });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        status: "error",
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.",
      });
    }

    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message:
          "Password reset link is invalid or has expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    user.loginAttempts = 0;
    user.lockUntil = null;

    await user.save();

    return res.status(200).json({
      status: "success",
      message:
        "Password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to reset password.",
    });
  }
};
```
