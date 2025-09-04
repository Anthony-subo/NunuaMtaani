const Product = require("../models/product");
const bucket = require("../config/firebase");
const fs = require("fs");

// Upload Product
const addProduct = async (req, res) => {
  try {
    const { shop_id, name, price, location, status } = req.body;

    if (!shop_id || !name || !price || !location || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: "All required fields + at least 1 image required." });
    }

    // Upload images to Firebase Storage
    const uploadedImages = [];
    for (const file of req.files) {
      const destFileName = `products/${Date.now()}-${file.originalname}`;
      await bucket.upload(file.path, {
        destination: destFileName,
        gzip: true,
        metadata: { cacheControl: "public, max-age=31536000" },
      });

      // Make file public
      const fileRef = bucket.file(destFileName);
      await fileRef.makePublic();

      uploadedImages.push(`https://storage.googleapis.com/${bucket.name}/${destFileName}`);

      // Remove temp file
      fs.unlink(file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }

    // Save product in MongoDB
    const newProduct = new Product({
      product_id: "product-" + Date.now(),
      shop_id,
      name,
      price,
      location,
      status: status || "available",
      images: uploadedImages,
    });

    await newProduct.save();
    res.status(201).json({ status: "success", message: "Product added", product: newProduct });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ status: "error", message: "Server error while saving product" });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ status: "error", message: "Server error while fetching products" });
  }
};

module.exports = { addProduct, getAllProducts };
