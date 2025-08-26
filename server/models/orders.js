const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'shops', required: true },
  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
      quantity: { type: Number, required: true },
      name: String,
      price: Number,
      image: String,
      location: String,
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled', 'deliver'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('orders', orderSchema);
