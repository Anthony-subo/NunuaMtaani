const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const UserModel = require("../models/users");

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

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all required fields.",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid email address.",
      });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.",
      });
    }

    const existingUser = await UserModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name,
      phone,
      email: email.toLowerCase(),
      location,
      password: hashedPassword,
      role,
    });

    const token = generateToken(newUser);

    const user = newUser.toObject();
    delete user.password;

    res.status(201).json({
      status: "success",
      token,
      user,
      message: "Registration successful.",
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

    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        message: "This account has been suspended.",
      });
    }

    // We will enable this after email verification is built.
    /*
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first."
      });
    }
    */

    if (
      user.lockUntil &&
      user.lockUntil > Date.now()
    ) {
      return res.status(423).json({
        message:
          "Account temporarily locked due to too many failed login attempts.",
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil =
          Date.now() + 15 * 60 * 1000;
      }

      await user.save();

      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();

    await user.save();

    const token = generateToken(user);

    const userData = user.toObject();
    delete userData.password;

    res.json({
      status: "success",
      token,
      user: userData,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Login failed.",
    });
  }
};