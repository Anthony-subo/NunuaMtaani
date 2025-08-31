const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Controllers
const { addProduct, getAllProducts } = require('../controllers/productController');

// Models
const Product = require('../models/product');
const Shop = require('../models/shop');

// ====================== MULTER CONFIG ======================
// Use memory storage (you can swap to diskStorage if you want to persist files)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ====================== ROUTES ======================

// @route   POST /api/products
// @desc    Add a new product
// @access  Private (seller)
router.post('/', upload.array('images', 4), addProduct);

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', getAllProducts);

// @route   GET /api/products/seller/products/:userId
// @desc    Get all products for a specific seller by userId
// @access  Private (seller)
router.get('/seller/products/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find shop linked to the seller
    const shop = await Shop.findOne({ user_id: userId });
    if (!shop) {
      return res.status(404).json({ message: 'No shop found for this user' });
    }

    // Fetch products belonging to that shop
    const products = await Product.find({ shop_id: shop._id });
    res.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product by product _id
// @access  Private (seller/admin)
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      status: 'success',
      message: 'Product deleted successfully',
      product: deletedProduct,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product fields by product _id
// @access  Private (seller/admin)
router.put('/:id', async (req, res) => {
  try {
    const { name, price, status } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, status },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      status: 'success',
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
