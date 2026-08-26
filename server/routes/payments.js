const router = require('express').Router();
const axios = require('axios');
const Order = require('../models/orders');

// ------------------ Helpers ------------------ //
function normalizePhone(phone) {
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) return '254' + cleaned.slice(1);
  if (cleaned.startsWith('7') || cleaned.startsWith('1')) return '254' + cleaned;
  return cleaned;
}

function makeTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
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
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // 🚫 prevent double payment
    if (order.status === 'paid') {
      return res.status(400).json({ error: 'Order is already paid' });
    }

    const phone = normalizePhone(buyerPhone);
    const token = await getDarajaToken();
    const timestamp = makeTimestamp();
    const password = makePassword(
      process.env.MPESA_SHORTCODE,
      process.env.MPESA_PASSKEY,
      timestamp
    );

    const payableAmount = Math.round(order.total);

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: payableAmount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
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

    return res.json({ 
      status: 'initiated', 
      checkoutId: response.data.CheckoutRequestID 
    });
  } catch (e) {
    console.error("❌ STK initiation error:", e.response?.data || e.message);
    return res.status(500).json({ 
      error: 'Failed to initiate STK', 
      details: e.response?.data || e.message 
    });
  }
});

// ------------------ STK CALLBACK ------------------ //
router.post('/stk/callback', async (req, res) => {
  try {
    const stk = req.body?.Body?.stkCallback;
    
    // Standard response to acknowledge receipt to Safaricom
    const acknowledgeSafaricom = () => res.json({ ResultCode: 0, ResultDesc: "Accepted" });

    if (!stk) return acknowledgeSafaricom();

    const checkoutId = stk.CheckoutRequestID;
    const resultCode = stk.ResultCode;
    const metadata = stk.CallbackMetadata?.Item || [];

    const mpesaReceipt = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = metadata.find(i => i.Name === 'Amount')?.Value;
    const phone  = metadata.find(i => i.Name === 'PhoneNumber')?.Value;

    const order = await Order.findOne({
      'payment.raw.CheckoutRequestID': checkoutId
    });

    if (!order) return acknowledgeSafaricom();

    // Check if paid amount matches rounded expected total
    const expectedAmount = Math.round(order.total);

    if (resultCode === 0 && Number(amount) !== expectedAmount) {
      order.status = 'failed';
      order.payment = {
        ...order.payment,
        raw: { ...order.payment?.raw, mismatch: true, expectedAmount, receivedAmount: amount }
      };
    } else {
      order.status = resultCode === 0 ? 'paid' : 'failed';
    }

    order.payment = {
      ...order.payment,
      mpesaReceipt: mpesaReceipt || order.payment?.mpesaReceipt,
      amount: amount || order.payment?.amount,
      payerPhone: phone ? String(phone) : order.payment?.payerPhone,
      callbackAt: new Date(),
      raw: { ...order.payment?.raw, ...stk }
    };

    await order.save();
    console.log(`✅ Order ${order._id} updated to status: ${order.status}`);

    return acknowledgeSafaricom();
  } catch (e) {
    console.error("❌ Callback error:", e.message);
    return res.json({ ResultCode: 1, ResultDesc: "Internal Error" });
  }
});

module.exports = router;