const express = require("express");
const router = express.Router();
const axios = require("axios");
const Order = require("../models/orders");
const Shop = require("../models/shop");

// Helpers
function makeTimestamp() {
  return new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
}
function makePassword(shortcode, passkey, timestamp) {
  return Buffer.from(shortcode + passkey + timestamp).toString("base64");
}
async function getDarajaToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return res.data.access_token;
}

// ✅ Initiate STK
router.post("/stk/initiate", async (req, res) => {
  try {
    const { orderId, buyerPhone } = req.body;
    const order = await Order.findById(orderId).populate("shop_id");
    if (!order) return res.status(404).json({ error: "Order not found" });

    const shop = order.shop_id;
    if (!shop) return res.status(400).json({ error: "Shop not linked" });

    const token = await getDarajaToken();
    const timestamp = makeTimestamp();
    const password = makePassword(
      process.env.MPESA_SHORTCODE,
      process.env.MPESA_PASSKEY,
      timestamp
    );

    // Normalize phone
    let phone = buyerPhone.replace(/\s+/g, "").replace(/^\+/, "");
    if (phone.startsWith("07")) phone = "254" + phone.substring(1);
    if (phone.startsWith("7")) phone = "254" + phone;

    // Decide shop payout
    let partyB = shop.payment_number || process.env.MPESA_SHORTCODE;
    if (shop.payment_method === "phone" && partyB.startsWith("07")) {
      partyB = "254" + partyB.substring(1);
    }

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: order.total ? Math.round(order.total) : 1,
      PartyA: phone,
      PartyB: partyB,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: order._id.toString().slice(-10),
      TransactionDesc: `Payment to ${shop.shop_name}`,
    };

    const mpesaRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const checkoutId = mpesaRes.data.CheckoutRequestID;
    order.payment = {
      ...order.payment,
      payerPhone: phone,
      paidTo: partyB,
      raw: { CheckoutRequestID: checkoutId },
    };
    await order.save();

    res.json(mpesaRes.data);
  } catch (e) {
    console.error("❌ STK initiation error:", e.response?.data || e.message);
    res.status(500).json({ error: "Failed to initiate STK" });
  }
});

// ✅ Callback
router.post("/stk/callback", async (req, res) => {
  try {
    const stk = req.body?.Body?.stkCallback;
    if (!stk) return res.status(400).json({ ok: false, message: "Invalid payload" });

    const checkoutId = stk.CheckoutRequestID;
    const resultCode = stk.ResultCode;
    const metadata = stk.CallbackMetadata?.Item || [];

    const mpesaReceipt = metadata.find(i => i.Name === "MpesaReceiptNumber")?.Value;
    const amount = metadata.find(i => i.Name === "Amount")?.Value;
    const phone = metadata.find(i => i.Name === "PhoneNumber")?.Value;

    const order = await Order.findOne({ "payment.raw.CheckoutRequestID": checkoutId });
    if (!order) return res.json({ ok: false, message: "Order not found" });

    order.status = resultCode === 0 ? "paid" : "failed";
    if (resultCode === 0 && Number(amount) !== order.total) {
      order.status = "failed";
      order.payment.raw.mismatch = true;
    }

    order.payment = {
      ...order.payment,
      mpesaReceipt,
      amount,
      payerPhone: phone || order.payment.payerPhone,
      callbackAt: new Date(),
      raw: { ...order.payment.raw, ...stk },
    };

    await order.save();
    res.json({ ok: true });
  } catch (e) {
    console.error("❌ Callback error:", e);
    res.status(500).json({ ok: false });
  }
});

module.exports = router;
