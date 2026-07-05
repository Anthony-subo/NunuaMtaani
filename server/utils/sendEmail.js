const transporter = require("../config/mail");

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"NunuaMtaani" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;