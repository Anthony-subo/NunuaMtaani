// models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_id: { type: String, unique: true },
  shop_id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },

  // Store image URLs instead of raw buffers
  images: [
    {
      url: { type: String, required: true }
    }
  ],

  status: {
    type: String,
    enum: ['available', 'sold', 'out-of-stock'],
    default: 'available'
  },
  timestamp: {
    type: String,
    default: () => new Date().toISOString()
  }
});

module.exports = mongoose.model('Product', productSchema);
