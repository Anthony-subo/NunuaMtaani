const Product = require('../models/product');

// Add Product
const addProduct = async (req, res) => {
  try {
    const { shop_id, name, price, location, status } = req.body;

    if (!shop_id || !name || !price || !location || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: "All required fields must be filled and at least 1 image provided." });
    }

    // Convert uploaded files (buffers) to MongoDB format
    const imageBuffers = req.files.map(file => ({
      data: file.buffer,
      contentType: file.mimetype,
    }));

    const newProduct = new Product({
      product_id: 'product-' + Date.now(),
      shop_id,
      name,
      price,
      location,
      status: status || 'available',
      images: imageBuffers,
    });

    await newProduct.save();

    res.status(201).json({
      status: 'success',
      message: 'Product added successfully',
      product: {
        _id: newProduct._id,
        product_id: newProduct.product_id,
        shop_id: newProduct.shop_id,
        name: newProduct.name,
        price: newProduct.price,
        location: newProduct.location,
        status: newProduct.status,
        imageCount: newProduct.images.length, // return only count
        createdAt: newProduct.createdAt,
      },
    });
  } catch (err) {
    console.error('Error saving product:', err);
    res.status(500).json({ status: 'error', message: 'Server error while saving product' });
  }
};

// Get All Products (lightweight, no raw images)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}, { images: 1, name: 1, price: 1, status: 1, shop_id: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .lean();

    const productsWithImageCount = products.map(p => ({
      ...p,
      imageCount: p.images?.length || 0,
      images: undefined, // remove binary data
    }));

    res.status(200).json(productsWithImageCount);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching products",
      error: err.message,
    });
  }
};

// Get Product Images (new endpoint)
const getProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id, { images: 1 });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // return actual images as base64
    const images = product.images.map(img => ({
      contentType: img.contentType,
      data: img.data.toString('base64'),
    }));

    res.status(200).json({ images });
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).json({ status: "error", message: "Server error while fetching images" });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductImages,
};
