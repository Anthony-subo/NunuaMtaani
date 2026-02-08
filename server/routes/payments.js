const router = require('express').Router();
const axios = require('axios');
const Order = require('../models/orders');

// ------------------ Helpers ------------------ //
function normalizePhone(phone) {
  if (phone.startsWith("0")) return "254" + phone.slice(1);
  if (phone.startsWith("7")) return "254" + phone;
  return phone;
}

function makeTimestamp() {
  return new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
}

function makePassword(shortcode, passkey, timestamp) {
  return Buffer.from(shortcode + passkey + timestamp).toString("base64");
}

async function getDarajaToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return response.data.access_token;
}

// ------------------ INITIATE STK ------------------ //
router.post('/stk/initiate', async (req, res) => {
  try {
    const { orderId, buyerPhone } = req.body;
    if (!orderId || !buyerPhone) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // 🚫 prevent double payment
    if (order.status === 'paid') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    const phone = normalizePhone(buyerPhone);
    const token = await getDarajaToken();
    const timestamp = makeTimestamp();
    const password = makePassword(
      process.env.MPESA_SHORTCODE,
      process.env.MPESA_PASSKEY,
      timestamp
    );

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(order.total),
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE, // ✅ MUST be shortcode owner
      PhoneNumber: phone,
      CallBackURL: `${process.env.API_URL}/api/payments/stk/callback`,
      AccountReference: "NunuaMtaani",
      TransactionDesc: `Order ${order._id}`
    };

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    order.payment = {
      ...order.payment,
      method: 'mpesa',
      payerPhone: phone,
      raw: { CheckoutRequestID: response.data.CheckoutRequestID }
    };

    await order.save();

    res.json({ status: 'initiated' });
  } catch (e) {
    console.error("❌ STK initiation error:", e.response?.data || e.message);
    res.status(500).json({ error: 'Failed to initiate STK' });
  }
});

// ------------------ STK CALLBACK ------------------ //
router.post('/stk/callback', async (req, res) => {
  try {
    const stk = req.body?.Body?.stkCallback;
    if (!stk) return res.json({ ok: false });

    const checkoutId = stk.CheckoutRequestID;
    const resultCode = stk.ResultCode;
    const metadata = stk.CallbackMetadata?.Item || [];

    const mpesaReceipt = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = metadata.find(i => i.Name === 'Amount')?.Value;
    const phone  = metadata.find(i => i.Name === 'PhoneNumber')?.Value;

    const order = await Order.findOne({
      'payment.raw.CheckoutRequestID': checkoutId
    });

    if (!order) return res.json({ ok: false });

    if (resultCode === 0 && Number(amount) !== order.total) {
      order.status = 'failed';
      order.payment.raw.mismatch = true;
    } else {
      order.status = resultCode === 0 ? 'paid' : 'failed';
    }

    order.payment = {
      ...order.payment,
      mpesaReceipt,
      amount,
      payerPhone: phone || order.payment.payerPhone,
      callbackAt: new Date(),
      raw: { ...order.payment.raw, ...stk }
    };

    await order.save();
    console.log(`✅ Order ${order._id} → ${order.status}`);

    res.json({ ok: true });
  } catch (e) {
    console.error("❌ Callback error:", e.message);
    res.json({ ok: false });
  }
});

module.exports = router;
