const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  pool: true, // Use pooled connections for performance
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 10000, // 10 seconds timeout
  greetingTimeout: 5000,
  socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection on server startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP Verification Error:", error.message);
  } else {
    console.log("✅ SMTP Server is ready to send emails");
  }
});

module.exports = transporter;