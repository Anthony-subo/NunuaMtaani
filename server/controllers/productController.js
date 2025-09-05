const Product = require("../models/product");
const Shop = require("../models/shop");
const bucket = require("../config/firebase");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// ====================== ADD PRODUCT ======================
exports.addProduct = async (req, res) => {
  try {
    const { shop_id, name, price, location, status, timestamp } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // ✅ Upload images to Firebase
    const imageUrls = [];
    for (const file of req.files) {
      const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
      const firebaseFile = bucket.file(`products/${fileName}`);

      await firebaseFile.save(fs.readFileSync(file.path), {
        metadata: { contentType: file.mimetype },
      });

      // Generate signed URL
      const [url] = await firebaseFile.getSignedUrl({
        action: "read",
        expires: "03-09-2099", // long expiration
      });

      imageUrls.push(url);

      // Clean up local temp file
      fs.unlinkSync(file.path);
    }

    // ✅ Save product in Mongo
    const newProduct = new Product({
      product_id: uuidv4(),
      shop_id,
      name,
      price,
      location,
      images: imageUrls,
      status,
      timestamp,
    });

    await newProduct.save();

    res.json({
      status: "success",
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ====================== GET ALL PRODUCTS ======================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("shop_id", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ====================== DELETE PRODUCT ======================
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      status: "success",
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ====================== UPDATE PRODUCT ======================
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, status } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, status },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      status: "success",
      message: "Product updated",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
