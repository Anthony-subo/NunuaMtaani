const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const UserModel = require("../models/users");
const sendEmail = require("../utils/sendEmail");
const generateVerificationToken = require("../utils/generateToken");

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

// Dummy hash used to prevent timing attacks on login non-existent users
const DUMMY_HASH =
  "$2b$10$e7V9/Gk5dD3yqP1pT6mZuu.f3Z4l/D3V9k2g6.2y0/2M0g6.2y0/2";

// Generate JWT
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
    const { name, phone, email, location, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please fill all required fields.",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email address.",
      });
    }

    // Validate password strength
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();

    // 1. Create User in MongoDB
    const newUser = await UserModel.create({
      name,
      phone,
      email: email.toLowerCase(),
      location,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const token = generateToken(newUser);
    const clientUrl = process.env.CLIENT_URL || "https://nunua-mtaani.vercel.app";
    const verificationLink = `${clientUrl}/verify-email/${verificationToken}`;

    // 2. Dispatch Email with Graceful Failure Handling
    try {
      await sendEmail({
        to: newUser.email,
        subject: "Welcome to NunuaMtaani - Verify Your Email",
        html: `
          <div style="font-family:Arial,sans-serif;padding:25px">
            <h2>Welcome to NunuaMtaani, ${newUser.name}!</h2>
            <p>Your account has been created successfully. Please verify your email to get started.</p>
            <a
              href="${verificationLink}"
              style="
                background:#0d6efd;
                color:white;
                padding:12px 20px;
                text-decoration:none;
                border-radius:5px;
                display:inline-block;
                margin:15px 0;
              "
            >
              Verify Email
            </a>
            <p style="color:#666;font-size:12px">This link will expire in 24 hours.</p>
          </div>
        `,
      });

      console.log("✅ Verification email sent to:", newUser.email);

      const user = newUser.toObject();
      delete user.password;

      return res.status(201).json({
        status: "success",
        token,
        user,
        message: "Registration successful. Please check your email to verify your account.",
      });

    } catch (emailError) {
      console.error("❌ Email Delivery Failed:", emailError.message);

      const user = newUser.toObject();
      delete user.password;

      // Account was created successfully in DB, so return 201 with warning
      return res.status(201).json({
        status: "warning",
        token,
        user,
        message:
          "Account created! However, we couldn't send the verification email. Please click 'Resend Verification' on the login screen.",
      });
    }

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists.",
      });
    }

    console.error("REGISTER ERROR:", err.message);

    return res.status(500).json({
      status: "error",
      message: "An internal server error occurred.",
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

    // Constant-time execution check to prevent user enumeration
    const targetPasswordHash = user ? user.password : DUMMY_HASH;
    const match = await bcrypt.compare(password, targetPasswordHash);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
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

    // Handle invalid password
    if (!match) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await user.save();

      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Reset login attempts on successful authentication
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();

    await user.save();

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

    const verificationToken = generateVerificationToken();

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await user.save();

    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your NunuaMtaani Account",
      html: `
        <div style="font-family:Arial;padding:25px">
          <h2>Hello ${user.name}</h2>
          <p>Here is your new verification link.</p>
          <a
            href="${verificationLink}"
            style="
              background:#0d6efd;
              color:white;
              padding:12px 20px;
              text-decoration:none;
              border-radius:5px;
              display:inline-block;
            "
          >
            Verify Email
          </a>
          <p style="margin-top:20px">
            This link expires in 24 hours.
          </p>
        </div>
      `,
    });

    return res.json({
      status: "success",
      message: "Verification email sent successfully.",
    });
  } catch (err) {
    console.error("RESEND VERIFICATION ERROR:", err.message);

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
      // Return 200 generic message to avoid email enumeration
      return res.status(200).json({
        status: "success",
        message: "If an account exists with this email, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(
      Date.now() + 60 * 60 * 1000 // 1 hour
    );

    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your NunuaMtaani Password",
      html: `
        <div style="font-family:Arial,sans-serif;padding:30px">
          <h2>Password Reset</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your password.</p>
          <a
            href="${resetLink}"
            style="
              display:inline-block;
              padding:12px 24px;
              background:#0d6efd;
              color:#fff;
              text-decoration:none;
              border-radius:5px;
            "
          >
            Reset Password
          </a>
          <p style="margin-top:20px">
            This link expires in 1 hour.
          </p>
          <hr>
          <small>
            If you didn't request this, simply ignore this email.
          </small>
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
        message: "Password reset link is invalid or has expired.",
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
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to reset password.",
    });
  }
};