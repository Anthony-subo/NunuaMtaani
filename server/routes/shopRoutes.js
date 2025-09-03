const express = require('express');
const router = express.Router();
const Shop = require('../models/shop');


// Create a new shop linked to a user

// Create a new shop linked to a user
router.post('/', async (req, res) => {
  try {
    const { 
      shop_name, 
      owner_name, 
      email, 
      location, 
      user_id, 
      payment_method, 
      payment_number, 
      commission_rate 
    } = req.body;

    // ✅ Validate required fields
    if (!shop_name || !owner_name || !email || !location || !user_id || !payment_method || !payment_number) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    // ✅ Validate payment method
    if (!['phone', 'till'].includes(payment_method)) {
      return res.status(400).json({ message: "Invalid payment method. Must be 'phone' or 'till'." });
    }

    // ✅ Commission defaults to 5% if not provided
    const newShop = new Shop({ 
      shop_name, 
      owner_name, 
      email, 
      location, 
      user: user_id, 
      payment_method, 
      payment_number, 
      commission_rate: commission_rate || 0.05 
    });

    await newShop.save();
    res.status(201).json(newShop);

  } catch (err) {
    console.error("Shop creation error:", err);
    res.status(500).json({ message: "Error creating shop", error: err.message });
  }
});

// Get shop by user ID
// ✅ Correct: GET /api/shops/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const shop = await Shop.findOne({ user: req.params.userId }); // match your model field
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json({ shop });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ✅ New: Get all shops
router.get('/', async (req, res) => {
  try {
    const shops = await Shop.find();
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch shops' });
  }
});


// Add this route to shop.js
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Shop.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Shop not found' });
    res.json({ message: 'Shop deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete shop', error: err.message });
  }
});


// PUT /api/shops/:shopId/status
router.put('/:shopId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'success', 'failed'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const updatedShop = await Shop.findByIdAndUpdate(
      req.params.shopId,
      { status },
      { new: true }
    );

    if (!updatedShop) return res.status(404).json({ message: 'Shop not found' });
    res.json(updatedShop);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
});


module.exports = router;
