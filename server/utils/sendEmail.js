const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("📨 Sending email via Resend to:", to);

    const { data, error } = await resend.emails.send({
      from: "NunuaMtaani <onboarding@resend.dev>", // Default testing domain
      to: Array.isArray(to) ? to : [to], // Resend expects an array for 'to'
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      throw new Error(error.message);
    }

    console.log("✅ Email sent successfully! ID:", data.id);
    return data;
  } catch (err) {
    console.error("❌ EMAIL DELIVERY FAILED:", err.message);
    throw err;
  }
};

module.exports = sendEmail;