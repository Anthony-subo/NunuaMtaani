const axios = require("axios");
const moment = require("moment");
const Order = require("../models/orderSchema"); // Path to your order model
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
    const { orderId, buyerPhone, phoneNumber } = req.body;
    const phoneToUse = buyerPhone || phoneNumber;

    if (!orderId || !phoneToUse) {
      return res.status(400).json({ error: "Missing required fields: orderId or buyerPhone" });
    }

    // Securely fetch order from DB to get the exact total amount
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const formattedPhone = formatPhoneNumber(phoneToUse);
    console.log(`📲 Initiating STK for Order ${orderId} (${order.total} KES) to ${formattedPhone}`);

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
        TransactionType: "CustomerBuyGoodsOnline", // Use CustomerPayBillOnline if using a PayBill
        Amount: Math.round(order.total), // Secure amount from DB
        PartyA: formattedPhone,
        PartyB: BUSINESS_SHORT_CODE, 
        PhoneNumber: formattedPhone,
        CallBackURL: `${BASE_URL}/api/payments/stk/callback`,
        AccountReference: `Order-${orderId}`,
        TransactionDesc: "App Order Payment",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Save CheckoutRequestID to the order so we can match the callback later
    const checkoutRequestId = response.data.CheckoutRequestID;
    order.payment = order.payment || {};
    order.payment.raw = { ...order.payment.raw, CheckoutRequestID: checkoutRequestId };
    await order.save();

    return res.json(response.data);
  } catch (error) {
    console.error("STK Error:", error.response?.data || error.message || error);
    return res.status(500).json({ 
      error: "Payment initiation failed", 
      details: error.response?.data || error.message 
    });
  }
};

const stkCallback = async (req, res) => {
  try {
    console.log("📩 STK Callback Payload:", JSON.stringify(req.body, null, 2));

    const callbackData = req.body?.Body?.stkCallback;
    if (!callbackData) {
      return res.status(400).json({ error: "Invalid callback structure" });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData;

    // Find the order associated with this CheckoutRequestID
    const order = await Order.findOne({ "payment.raw.CheckoutRequestID": CheckoutRequestID });

    if (!order) {
      console.warn(`⚠️ Order not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return res.json({ ResponseCode: "0", ResponseDesc: "Accepted" });
    }

    if (ResultCode === 0) {
      // Payment Successful
      let mpesaReceiptNumber = "";
      let amountPaid = 0;
      let transactionDate = "";

      if (CallbackMetadata && CallbackMetadata.Item) {
        CallbackMetadata.Item.forEach((item) => {
          if (item.Name === "MpesaReceiptNumber") mpesaReceiptNumber = item.Value;
          if (item.Name === "Amount") amountPaid = item.Value;
          if (item.Name === "TransactionDate") transactionDate = item.Value;
        });
      }

      order.status = "paid";
      order.payment.paidTo = BUSINESS_SHORT_CODE;
      order.payment.mpesaReceipt = mpesaReceiptNumber;
      order.payment.amount = amountPaid;
      order.payment.callbackAt = new Date();
      order.payment.raw = { ...order.payment.raw, callbackResponse: callbackData };

      await order.save();
      console.log(`🎉 Order ${order._id} marked as PAID. Receipt: ${mpesaReceiptNumber}`);
    } else {
      // Payment Failed / Cancelled by User
      order.status = "failed";
      order.payment.callbackAt = new Date();
      order.payment.raw = { ...order.payment.raw, callbackResponse: callbackData };

      await order.save();
      console.log(`❌ Order ${order._id} payment failed: ${ResultDesc}`);
    }

    return res.json({ ResponseCode: "0", ResponseDesc: "success" });
  } catch (error) {
    console.error("Callback Processing Error:", error);
    return.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { initiateSTK, stkCallback };