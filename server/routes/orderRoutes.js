const express = require('express');
const axios = require('axios');
const router = express.Router();
const Order = require('../models/orders');
const Shop = require('../models/shop');
const Product = require('../models/product');

// ------------------ Helpers ------------------ //
function makeTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
}

function makePassword(shortcode, passkey) {
  const timestamp = makeTimestamp();
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

// ------------------ Create Order + Trigger STK ------------------ //
router.post('/', async (req, res) => {
  try {
    const { user_id, shop_id, items, total, payment } = req.body;

    if (!user_id || !shop_id || !items || items.length === 0 || !total) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ✅ Ensure shop exists
    const shop = await Shop.findById(shop_id);
    if (!shop) {
      return res.status(404).json({ message: 'Seller shop not found' });
    }

    // ✅ Ensure all products exist
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product_id}` });
      }
    }

    // ✅ Save order first
    const newOrder = new Order({
      user_id,
      shop_id,
      items: items.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        name: i.name,
        price: i.price,
        image: i.image,
        location: i.location
      })),
      total,
      status: "pending",
      payment: {
        method: payment?.method || 'mpesa',
        payerPhone: payment?.payerPhone || null,
        paidTo: shop.payment_number,
        mpesaReceipt: null,
        callbackAt: null,
        raw: {}
      }
    });

    await newOrder.save();

    // ✅ If payment is mpesa, trigger STK Push
    if (payment?.method === "mpesa" && payment?.payerPhone) {
      try {
        const token = await getDarajaToken();
        const timestamp = makeTimestamp();
        const password = makePassword(process.env.MPESA_SHORTCODE, process.env.MPESA_PASSKEY);

        const payload = {
          BusinessShortCode: process.env.MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.round(total),
          PartyA: payment.payerPhone,
          PartyB: shop.payment_number, // shop till/phone
          PhoneNumber: payment.payerPhone,
          CallBackURL: `${process.env.API_URL}/api/payments/stk/callback`,
          AccountReference: shop.shop_name.slice(0, 15),
          TransactionDesc: `Order ${newOrder._id}`
        };

        const response = await axios.post(
          'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Save STK request ID in order
        newOrder.payment.raw.CheckoutRequestID = response.data.CheckoutRequestID;
        await newOrder.save();
      } catch (err) {
        console.error("❌ STK Push error:", err.response?.data || err.message);
      }
    }

    res.status(201).json(newOrder);

  } catch (err) {
    console.error('❌ Error placing order:', err);
    res.status(500).json({ message: 'Failed to place order', error: err.message });
  }
});
