const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  addProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");
const Product = require("../models/product");
const Shop = require("../models/shop");

// ✅ Use an absolute path for temp folder
const tempDir = path.join(__dirname, "../uploads/temp");

// ✅ Ensure folder exists at runtime
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Multer config (save to temp folder before Firebase upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ====================== ROUTES ======================

// POST /api/products - Add a new product
router.post("/", upload.array("images", 4), addProduct);

// GET /api/products - Get all products
router.get("/", getAllProducts);

// GET /api/products/seller/products/:userId - Get all products for a seller
router.get("/seller/products/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const shop = await Shop.findOne({ user_id: userId });

    if (!shop) {
      return res.status(404).json({ message: "No shop found for this user" });
    }

    const products = await Product.find({ shop_id: shop._id });
    res.json(products);
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/products/:id - Delete a product by _id
router.delete("/:id", deleteProduct);

// PUT /api/products/:id - Update a product by _id
router.put("/:id", updateProduct);

module.exports = router;
