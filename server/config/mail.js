const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS for port 587
  family: 4,     // Force IPv4 connection to prevent Render IPv6 timeouts
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP Verification Error:", error.message);
  } else {
    console.log("✅ SMTP Server is ready to send emails");
  }
});

module.exports = transporter;