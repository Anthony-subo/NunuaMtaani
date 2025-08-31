const Product = require('../models/product');
const fs = require('fs');
const path = require('path');

// ✅ Add Product with images saved in MongoDB
const addProduct = async (req, res) => {
  try {
    const { shop_id, name, price, location, status } = req.body;

    if (!shop_id || !name || !price || !location || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: "All required fields must be filled and at least 1 image provided." });
    }

    // Convert uploaded files into Buffer for MongoDB
    const imageBuffers = req.files.map(file => ({
      data: fs.readFileSync(path.join(file.path)), // read file as buffer
      contentType: file.mimetype
    }));

    const newProduct = new Product({
      product_id: 'product-' + Date.now(),
      shop_id,
      name,
      price,
      location,
      status: status || 'available',
      images: imageBuffers
    });

    await newProduct.save();

    res.status(201).json({ 
      status: 'success', 
      message: 'Product added successfully', 
      product: newProduct 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error while saving product' });
  }
};

// ✅ Get All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error while fetching products' });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
};
