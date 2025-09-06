const axios = require("axios");
const moment = require("moment");
require("dotenv").config();

const BUSINESS_SHORT_CODE = 174379; // ✅ Till Number
const PASSKEY = process.env.MPESA_PASSKEY;
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const BASE_URL = process.env.BASE_URL;

async function getAccessToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
    "base64"
  );
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  return response.data.access_token;
}

exports.initiateSTKPush = async (req, res) => {
  try {
    const { amount, phoneNumber, orderId } = req.body;

    if (!amount || !phoneNumber) {
      return res.status(400).json({ error: "Missing fields" });
    }

    console.log("Initiating STK for Order:", orderId);

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
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: BUSINESS_SHORT_CODE, // ✅ Fixed Till
        PhoneNumber: phoneNumber,
        CallBackURL: `${BASE_URL}/api/payments/stk/callback`,
        AccountReference: "NunuaMtaani",
        TransactionDesc: "NunuaMtaani Order Payment",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "STK Error:",
      error.response?.data || error.message || error
    );
    res.status(500).json({ error: "Payment initiation failed" });
  }
};
