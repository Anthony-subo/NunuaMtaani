const express = require('express');
const router = express.Router();
const Order = require('../models/orders');
const Shop = require('../models/shop');

// POST /api/orders - create a new order
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

// GET /api/orders - fetch all orders (admin use)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

// GET /api/orders/seller/:shop_id - seller-specific orders
router.get('/seller/:shop_id', async (req, res) => {
  const { shop_id } = req.params;

  try {
    const orders = await Order.find({ shop_id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// GET /api/orders/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});



// PUT /api/orders/:id/status - update order status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'completed', 'cancelled', 'deliver'];

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
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

module.exports = router;
