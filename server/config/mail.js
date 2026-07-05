const nodemailer = require("nodemailer");

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Check email configuration when the server starts
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email configuration error:");
    console.log(error.message);
  } else {
    console.log("✅ Email server is ready.");
  }
});

module.exports = transporter;