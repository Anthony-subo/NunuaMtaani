// controllers/productController.js
const Product = require('../models/product');

const addProduct = async (req, res) => {
  try {
    const { shop_id, name, price, location, status } = req.body;

    if (!shop_id || !name || !price || !location || !req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "All required fields must be filled and at least 1 image provided."
      });
    }

    // ✅ Convert images to Base64
    const base64Images = req.files.map(file => {
      return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    });

    const newProduct = new Product({
      product_id: 'product-' + Date.now(),
      shop_id,
      name,
      price,
      location,
      status: status || 'available',
      images: base64Images
    });

    await newProduct.save();
    res.status(201).json({
      status: 'success',
      message: 'Product added successfully',
      product: newProduct
    });
  } catch (err) {
    console.error("Error saving product:", err);
    res.status(500).json({
      status: 'error',
      message: 'Server error while saving product'
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ status: 'error', message: 'Server error while fetching products' });
  }
};

module.exports = { addProduct, getAllProducts };
