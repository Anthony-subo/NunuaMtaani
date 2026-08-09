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

    console.log("✅ Email sent successfully");
    console.log(info);

    return info;

  } catch (err) {
    console.log("❌ EMAIL ERROR");
    console.log("Code:", err.code);
    console.log("Message:", err.message);
    console.log("Response:", err.response);
    console.log("Response Code:", err.responseCode);
    console.log(err);

    throw err;
  }
};

module.exports = sendEmail;