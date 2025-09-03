// routes/payments.js
const router = require('express').Router();
const axios = require('axios');
const Order = require('../models/orders');
const Shop = require('../models/shop');

// getDarajaToken(): your OAuth function (omitted for brevity)

router.post('/stk/initiate', async (req, res) => {
  try {
    const { orderId, buyerPhone } = req.body;
    const order = await Order.findById(orderId).populate('sellerShop');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const sellerTarget = order.sellerShop.payment_number; // phone or till
    const token = await getDarajaToken();

    // NOTE: Official Daraja flows prefer Till/Paybill; PartyB=phone (Pochi) works in practice for many,
    // but confirm in your environment/sandbox/aggregator.
    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,  // your shortcode
      Password: makePassword(process.env.MPESA_SHORTCODE, process.env.MPESA_PASSKEY),
      Timestamp: makeTimestamp(),
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(order.total),
      PartyA: buyerPhone,
      PartyB: sellerTarget,             // 👈 direct to seller (phone or till)
      PhoneNumber: buyerPhone,
      CallBackURL: `${process.env.API_URL}/api/payments/stk/callback`,
      AccountReference: order.sellerShop.shop_name.slice(0, 15),
      TransactionDesc: `Order ${order._id}`
    };

    await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Save request meta
    order.payment = { payerPhone: buyerPhone, paidTo: sellerTarget };
    await order.save();

    res.json({ status: 'initiated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to initiate STK' });
  }
  
});
// routes/payments.js (continue)
router.post('/stk/callback', async (req, res) => {
  try {
    const cb = req.body; // validate signature if you set one
    const resultCode = cb?.Body?.stkCallback?.ResultCode;
    const metadata = cb?.Body?.stkCallback?.CallbackMetadata?.Item || [];
    const mpesaReceipt = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = metadata.find(i => i.Name === 'Amount')?.Value;
    const phone  = metadata.find(i => i.Name === 'PhoneNumber')?.Value;
    const desc   = cb?.Body?.stkCallback?.ResultDesc;

    // Reconcile to order by parsing AccountReference/desc or store CheckoutRequestID
    // in the order when initiating and match here.
    const checkoutId = cb?.Body?.stkCallback?.CheckoutRequestID;
    const order = await Order.findOne({ 'payment.raw.CheckoutRequestID': checkoutId }) 
                || await Order.findOne({ 'payment.payerPhone': String(phone) }).sort({ createdAt: -1 });

    if (order) {
      order.status = resultCode === 0 ? 'paid' : 'failed';
      order.payment = {
        ...order.payment,
        mpesaReceipt,
        callbackAt: new Date(),
        raw: cb
      };
      await order.save();
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.json({ ok: false });
  }
});

