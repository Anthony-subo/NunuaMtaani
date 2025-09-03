const router = require('express').Router();
const axios = require('axios');
const Order = require('../models/orders');
const Shop = require('../models/shop');

// ------------------ Helpers ------------------ //
function makeTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
}

function makePassword(shortcode, passkey, timestamp) {
  const data = shortcode + passkey + timestamp;
  return Buffer.from(data).toString("base64");
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

// ------------------ Initiate STK ------------------ //
router.post('/stk/initiate', async (req, res) => {
  try {
    const { orderId, buyerPhone } = req.body;

    const order = await Order.findById(orderId).populate('shop_id');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const sellerTarget = order.shop_id.payment_number; // must be a paybill/till number
    const token = await getDarajaToken();
    const timestamp = makeTimestamp();
    const password = makePassword(process.env.MPESA_SHORTCODE, process.env.MPESA_PASSKEY, timestamp);

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(order.total),
      PartyA: buyerPhone,
      PartyB: sellerTarget,
      PhoneNumber: buyerPhone,
      CallBackURL: `${process.env.API_URL}/api/payments/stk/callback`,
      AccountReference: order.shop_id.shop_name.slice(0, 15),
      TransactionDesc: `Order ${order._id}`
    };

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const checkoutId = response.data.CheckoutRequestID;

    // Save initiation details in order
    order.payment = {
      ...order.payment,
      payerPhone: buyerPhone,
      paidTo: sellerTarget,
      raw: { CheckoutRequestID: checkoutId }
    };
    await order.save();

    res.json({ status: 'initiated', checkoutId });
  } catch (e) {
    console.error("❌ STK initiation error:", e.response?.data || e.message);
    res.status(500).json({ error: 'Failed to initiate STK' });
  }
});

// ------------------ Handle STK Callback ------------------ //
router.post('/stk/callback', async (req, res) => {
  try {
    const cb = req.body;
    const stk = cb?.Body?.stkCallback;

    if (!stk) {
      console.error("❌ Invalid callback payload:", cb);
      return res.status(400).json({ ok: false, message: "Invalid payload" });
    }

    const checkoutId = stk.CheckoutRequestID;
    const resultCode = stk.ResultCode; // 0 = Success
    const metadata = stk.CallbackMetadata?.Item || [];

    const mpesaReceipt = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = metadata.find(i => i.Name === 'Amount')?.Value;
    const phone  = metadata.find(i => i.Name === 'PhoneNumber')?.Value;

    // Find the order
    const order = await Order.findOne({ 'payment.raw.CheckoutRequestID': checkoutId });

    if (!order) {
      console.error("❌ No matching order for CheckoutRequestID:", checkoutId);
      return res.json({ ok: false, message: "Order not found" });
    }

    // Check amount consistency
    if (resultCode === 0 && Number(amount) !== order.total) {
      order.status = 'failed';
      order.payment.raw.mismatch = true;
      console.error(`❌ Amount mismatch for order ${order._id}`);
    } else {
      order.status = resultCode === 0 ? 'paid' : 'failed';
    }

    // Update payment details
    order.payment = {
      ...order.payment,
      mpesaReceipt,
      amount,
      payerPhone: phone || order.payment.payerPhone,
      callbackAt: new Date(),
      raw: { ...order.payment.raw, ...stk }
    };

    await order.save();

    console.log(`✅ Order ${order._id} marked as ${order.status}`);
    res.json({ ok: true });
  } catch (e) {
    console.error("❌ Error processing STK callback:", e);
    res.status(500).json({ ok: false });
  }
});

module.exports = router;
