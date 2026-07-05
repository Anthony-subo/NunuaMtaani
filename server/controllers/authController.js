const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const UserModel = require("../models/users");
const sendEmail = require("../utils/sendEmail");
const generateVerificationToken = require("../utils/generateToken");

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

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
        message: "Please fill all required fields.",
      });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid email address.",
      });
    }

    // Validate password strength
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.",
      });
    }

    // Check if email already exists
    const existingUser = await UserModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user
    const newUser = await UserModel.create({
      name,
      phone,
      email: email.toLowerCase(),
      location,
      password: hashedPassword,
      role,

      isVerified: false,
      verificationToken,
      verificationTokenExpires:
        new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours
    });

    // JWT Token
    const token = generateToken(newUser);

    // Verification Link
    const verificationLink =
      `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // Send Email
    await sendEmail({
      to: newUser.email,
      subject: "Verify your NunuaMtaani Account",
      html: `
      <div style="font-family:Arial,sans-serif;padding:30px">
        <h2>Welcome to NunuaMtaani 🎉</h2>

        <p>Hello <strong>${newUser.name}</strong>,</p>

        <p>
        Thank you for registering.
        Please verify your email by clicking the button below.
        </p>

        <a
          href="${verificationLink}"
          style="
            display:inline-block;
            padding:12px 24px;
            background:#0d6efd;
            color:white;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Verify Email
        </a>

        <p style="margin-top:20px">
          This link expires in <strong>24 hours</strong>.
        </p>

        <hr>

        <small>
          If you didn't create this account,
          please ignore this email.
        </small>
      </div>
      `,
    });

    // Remove password before returning user
    const user = newUser.toObject();
    delete user.password;

    res.status(201).json({
      status: "success",
      token,
      user,
      message:
        "Registration successful. Please check your email to verify your account.",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Registration failed.",
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
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
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

    res.status(200).json({
      status: "success",
      token,
      user: userData,
      message: "Login successful.",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
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
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Email verification failed.",
    });
  }
};