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

// ✅ GET /api/orders - fetch all orders (admin use)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

// ✅ GET /api/orders/seller/:shop_id - seller-specific orders
router.get('/seller/:shop_id', async (req, res) => {
  const { shop_id } = req.params;
  console.log("📦 Fetching orders for shop:", shop_id);

  try {
    const orders = await Order.find({ shop_id }).sort({ createdAt: -1 });
    console.log("Found orders:", orders.length);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching seller orders:', err);
    res.status(500).json({ message: 'Failed to fetch seller orders.' });
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

    const code = crypto.randomBytes(3).toString('hex'); // short 6-digit code

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

// ✅ Verify delivery code (rider confirms delivery)
router.post('/:id/verify-delivery', async (req, res) => {
  try {
    const { code } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!order.delivery || order.delivery.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    order.delivery.status = 'delivered';
    order.status = 'completed';
    await order.save();

    res.json({ message: 'Delivery confirmed successfully', order });
  } catch (err) {
    console.error('Error verifying delivery:', err);
    res.status(500).json({ message: 'Failed to verify delivery.' });
  }
});


module.exports = router;
