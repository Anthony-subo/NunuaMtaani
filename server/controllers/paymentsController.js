const axios = require("axios");
const moment = require("moment");
require("dotenv").config();

const BUSINESS_SHORT_CODE = process.env.MPESA_SHORTCODE || "174379";
const PASSKEY = process.env.MPESA_PASSKEY;
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const BASE_URL = process.env.BASE_URL;

async function getAccessToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
}

// Helper to format Kenya phone numbers to 254XXXXXXXXX format
function formatPhoneNumber(phone) {
  let cleaned = phone.toString().replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    return "254" + cleaned.substring(1);
  }
  if (cleaned.startsWith("254")) {
    return cleaned;
  }
  return cleaned;
}

const initiateSTK = async (req, res) => {
  try {
    const { amount, phoneNumber, orderId } = req.body;

    if (!amount || !phoneNumber) {
      return res.status(400).json({ error: "Missing required fields: amount or phoneNumber" });
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log(`📲 Initiating STK for Order ${orderId} to ${formattedPhone}`);

    const token = await getAccessToken();
    const timestamp = moment().format("YYYYMMDDHHmmss");

    const password = Buffer.from(
      BUSINESS_SHORT_CODE + PASSKEY + timestamp
    ).toString("base64");

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        // Use "CustomerBuyGoodsOnline" for Till Numbers, "CustomerPayBillOnline" for PayBill
        TransactionType: "CustomerBuyGoodsOnline",
        Amount: Math.round(amount), // Ensure integer amount
        PartyA: formattedPhone,
        PartyB: BUSINESS_SHORT_CODE, 
        PhoneNumber: formattedPhone,
        CallBackURL: `${BASE_URL}/api/payments/stk/callback`,
        AccountReference: orderId ? `Order-${orderId}` : "NunuaMtaani",
        TransactionDesc: "NunuaMtaani Order Payment",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("STK Error:", error.response?.data || error.message || error);
    return res.status(500).json({ 
      error: "Payment initiation failed", 
      details: error.response?.data || error.message 
    });
  }
};

const stkCallback = (req, res) => {
  console.log("📩 STK Callback Payload:", JSON.stringify(req.body, null, 2));

  // Safaricom Daraja standard success response
  res.json({
    ResponseCode: "0",
    ResponseDesc: "success"
  });
};

module.exports = { initiateSTK, stkCallback };