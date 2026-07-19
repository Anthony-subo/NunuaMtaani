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
    console.log("✅ Email server is ready.");
    console.log(`📧 Sending emails from: ${process.env.EMAIL_USER}`);
  }
});

module.exports = transporter;