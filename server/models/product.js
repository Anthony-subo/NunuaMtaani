const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_id: { type: String, unique: true },
  shop_id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },

  // Store images directly as binary (Buffer) with content type
  images: [{
    data: Buffer,
    contentType: String
  }],

  status: { 
    type: String, 
    enum: ['available', 'sold', 'out-of-stock'], 
    default: 'available' 
  },

  timestamp: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true }); // 👈 adds createdAt and updatedAt automatically

module.exports = mongoose.model('Product', productSchema);
