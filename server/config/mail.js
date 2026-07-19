const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Email configuration error:");
    console.error(error);
  } else {
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");
    console.log("✅ Email server is ready.");
    console.log(`📧 Sending emails from: ${process.env.EMAIL_USER}`);
  }
});

module.exports = transporter;