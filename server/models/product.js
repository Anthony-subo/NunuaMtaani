const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_id: { type: String, unique: true },
    shop_id: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    images: [String], // ✅ Firebase URLs
    status: {
      type: String,
      enum: ["available", "sold", "out-of-stock"],
      default: "available",
    },
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
