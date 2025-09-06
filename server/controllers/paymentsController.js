const axios = require("axios");
const moment = require("moment");

// Your fixed Till number
const BUSINESS_SHORT_CODE = 174379;

const initiateSTK = async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body;

    if (!amount || !phoneNumber) {
      return res.status(400).json({ error: "Amount and phone number required" });
    }

    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = Buffer.from(
      `${BUSINESS_SHORT_CODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        auth: {
          username: process.env.MPESA_CONSUMER_KEY,
          password: process.env.MPESA_CONSUMER_SECRET,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const stkRequest = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,          // buyer’s phone
      PartyB: BUSINESS_SHORT_CODE,  // your fixed Till
      PhoneNumber: phoneNumber,     // buyer’s phone
      CallBackURL: `${process.env.BASE_URL}/api/payments/stk/callback`,
      AccountReference: "NunuaMtaani",
      TransactionDesc: "Purchase on NunuaMtaani",
    };

    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(stkResponse.data);
  } catch (error) {
    console.error("❌ STK initiation error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to initiate STK" });
  }
};

// ✅ Callback endpoint (Safaricom will hit this)
const stkCallback = (req, res) => {
  console.log("📩 STK Callback:", JSON.stringify(req.body, null, 2));
  res.json({ status: "ok" });
};

module.exports = { initiateSTK, stkCallback };
