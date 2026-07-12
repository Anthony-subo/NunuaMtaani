const transporter = require("../config/mail");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"NunuaMtaani" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ Failed to send email:");
    console.error(error);

    throw error;
  }
};

module.exports = sendEmail;