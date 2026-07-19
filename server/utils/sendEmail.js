const transporter = require("../config/mail");

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("📨 Sending email to:", to);

    const info = await transporter.sendMail({
      from: `"NunuaMtaani" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent!");
    console.log(info.response);

    return info;
  } catch (err) {
    console.error("❌ Email Error:");
    console.error(err);

    throw err;
  }
};

module.exports = sendEmail;