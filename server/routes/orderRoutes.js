const express = require('express');
const router = express.Router();
const Order = require('../models/orders');
const crypto = require('crypto');

// ✅ POST /api/orders - create a new order
router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: 'Failed to place order.' });
  }
});

// ✅ GET /api/orders - fetch all orders (Admin use)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user_id', 'name email')
      .populate('sellerShop', 'shop_name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

// ✅ GET /api/orders/seller/:shop_id - seller-specific orders
router.get('/seller/:shop_id', async (req, res) => {
  const { shop_id } = req.params;

  console.log("📦 Fetching orders for shop:", shop_id);

  try {
    const orders = await Order.find({ sellerShop: shop_id }).sort({ createdAt: -1 });

    console.log("Found orders:", orders.length);

    res.json(orders);
  } catch (err) {
    console.error("Error fetching seller orders:", err);
    res.status(500).json({ message: "Failed to fetch seller orders." });
  }
});

// ✅ GET /api/orders/user/:userId - buyer-specific orders
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Failed to fetch user orders.' });
  }
});

// ✅ GET /api/orders/:id/status - Check order & payment status (Used by frontend polling)
router.get('/:id/status', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select('status payment');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ status: order.status, payment: order.payment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// ✅ PUT /api/orders/:id/status - update order status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'paid', 'deliver', 'completed', 'cancelled', 'failed'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Failed to update order status.' });
  }
});

// ✅ Assign rider to order
router.put('/:id/assign-rider', async (req, res) => {
  try {
    const { riderId } = req.body;

    if (!riderId) return res.status(400).json({ message: 'Rider ID required' });

    const code = crypto.randomBytes(3).toString('hex'); // short code

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        delivery: { rider_id: riderId, code, status: 'assigned' },
        status: 'deliver'
      },
      { new: true }
    ).populate('delivery.rider_id');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (err) {
    console.error('Error assigning rider:', err);
    res.status(500).json({ message: 'Failed to assign rider.' });
  }
});



module.exports = router;