const express = require('express');
const router = express.Router();
const multer = require('multer');

const { addProduct, getAllProducts } = require('../controllers/productController');
const Product = require('../models/product');
const Shop = require('../models/shop');

// ====================== MULTER CONFIG ======================
// Store files in memory instead of writing them to disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ====================== ROUTES ======================

// POST /api/products - Add a new product
router.post('/', upload.array('images', 4), addProduct);

// GET /api/products - Get all products (lightweight: no binary images)
router.get('/', getAllProducts);

// GET /api/products/seller/products/:userId - Get all products for a seller
router.get('/seller/products/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const shop = await Shop.findOne({ user_id: userId });

    if (!shop) {
      return res.status(404).json({ message: 'No shop found for this user' });
    }

    const products = await Product.find({ shop_id: shop._id }).lean();
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

// ====================== IMAGE ROUTES ======================
// GET /api/products/:id/images/:index - fetch single image
router.get('/:id/images/:index', async (req, res) => {
  try {
    const { id, index } = req.params;
    const idx = parseInt(index, 10);

    if (isNaN(idx)) {
      return res.status(400).json({ message: 'Index must be a number' });
    }

    const product = await Product.findById(id);
    if (!product || !product.images[idx]) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.contentType(product.images[idx].contentType);
    res.send(product.images[idx].data);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
