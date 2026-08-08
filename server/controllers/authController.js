```js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
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

    const { name, phone, email, location, password, role } = req.body;

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

    // Verification link
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

      subject: "Verify Your NunuaMtaani Account",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 30px;
          background-color: #f8fafc;
          color: #1f2937;
        ">

          <div style="
            background-color: #2563eb;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          ">
            <h1 style="
              color: #ffffff;
              margin: 0;
            ">
              NunuaMtaani
            </h1>
          </div>

          <div style="
            background-color: #ffffff;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          ">

            <h2>Welcome, ${newUser.name}!</h2>

            <p>
              Thank you for creating a NunuaMtaani account.
            </p>

            <p>
              Please verify your email address to activate your account
              and start using NunuaMtaani.
            </p>

            <div style="text-align: center; margin: 30px 0;">

              <a
                href="${verificationLink}"
                style="
                  display: inline-block;
                  padding: 14px 24px;
                  background-color: #2563eb;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                "
              >
                Verify My Email
              </a>

            </div>

            <p>
              This verification link will expire in
              <strong>24 hours</strong>.
            </p>

            <p>
              If the button above does not work, copy and paste the
              following link into your browser:
            </p>

            <p style="
              word-break: break-all;
              color: #2563eb;
            ">
              ${verificationLink}
            </p>

            <p>
              If you did not create a NunuaMtaani account,
              you can safely ignore this email.
            </p>

            <p>
              Regards,<br />
              <strong>NunuaMtaani Team</strong>
            </p>

          </div>

        </div>
      `,
    });

    console.log("✅ Verification email sent.");

    // Remove password before returning user
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

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Find user
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
    console.error("========== LOGIN ERROR ==========");
    console.error(err);
    console.error(err.stack);

    return res.status(500).json({
      status: "error",
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

    // Verify account
    user.isVerified = true;

    // Clear verification token
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("========== VERIFY EMAIL ERROR ==========");
    console.error(error);
    console.error(error.stack);

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

    // Validate email
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required.",
      });
    }

    // Find user
    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "No account found with this email.",
      });
    }

    // Check if already verified
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

    // Generate verification link
    const verificationLink =
      `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    console.log("New verification link:");
    console.log(verificationLink);

    // =====================
    // SEND VERIFICATION EMAIL
    // =====================

    await sendEmail({
      to: user.email,

      subject: "Verify Your NunuaMtaani Account",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 30px;
          background-color: #f8fafc;
          color: #1f2937;
        ">

          <div style="
            background-color: #2563eb;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          ">
            <h1 style="
              color: #ffffff;
              margin: 0;
            ">
              NunuaMtaani
            </h1>
          </div>

          <div style="
            background-color: #ffffff;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          ">

            <h2>Hello ${user.name},</h2>

            <p>
              We received a request to resend your NunuaMtaani
              account verification email.
            </p>

            <p>
              Click the button below to verify your email address:
            </p>

            <div style="text-align: center; margin: 30px 0;">

              <a
                href="${verificationLink}"
                style="
                  display: inline-block;
                  padding: 14px 24px;
                  background-color: #2563eb;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                "
              >
                Verify My Email
              </a>

            </div>

            <p>
              This verification link will expire in
              <strong>24 hours</strong>.
            </p>

            <p>
              If the button does not work, copy and paste this link
              into your browser:
            </p>

            <p style="
              word-break: break-all;
              color: #2563eb;
            ">
              ${verificationLink}
            </p>

            <p>
              If you did not request this email, you can safely
              ignore it.
            </p>

            <p>
              Regards,<br />
              <strong>NunuaMtaani Team</strong>
            </p>

          </div>

        </div>
      `,
    });

    console.log("✅ Verification email resent successfully.");

    return res.status(200).json({
      status: "success",
      message: "Verification email sent successfully.",
    });
  } catch (err) {
    console.error("========== RESEND VERIFICATION ERROR ==========");
    console.error(err);
    console.error(err.stack);

    return res.status(500).json({
      status: "error",
      message: "Unable to send verification email.",
    });
  }
};
```

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
      Date.now() + 60 * 60 * 1000 // 1 hour
    );

    await user.save();

    const resetLink =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your NunuaMtaani Password",
      html: `
      <div style="font-family:Arial,sans-serif;padding:30px">

        <h2>Password Reset</h2>

        <p>Hello <strong>${user.name}</strong>,</p>

          <p>
          We received a request to reset your password.
          </p>

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
      message: "Password reset link has been sent to your email.",
    });

  } catch (error) {
    console.error(error);

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

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Unable to reset password.",
    });

  }
};
