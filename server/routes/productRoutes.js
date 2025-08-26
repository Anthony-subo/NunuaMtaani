const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { addProduct, getAllProducts } = require('../controllers/productController');
const Product = require('../models/product');
const Shop = require('../models/shop');

// Ensure the uploads folder exists
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ====================== ROUTES ======================

// POST /api/products - Add a new product
router.post('/', upload.array('images', 4), addProduct);

// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/seller/products/:userId - Get all products for a seller
router.get('/seller/products/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const shop = await Shop.findOne({ user_id: userId });

    if (!shop) {
      return res.status(404).json({ message: 'No shop found for this user' });
    }

    const products = await Product.find({ shop_id: shop._id });
    res.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/products/:id - Delete a product by _id
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ status: 'success', message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/products/:id - Update a product by _id
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

    res.json({ status: 'success', message: 'Product updated', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
