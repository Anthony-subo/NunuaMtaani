const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'shops', required: true },

  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
      quantity: { type: Number, required: true },
      name: String,
      price: { type: Number, required: true },
      image: String,
      location: String
    }
  ],

  total: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'paid', 'deliver', 'completed', 'cancelled', 'failed'],
    default: 'pending'
  },

  payment: {
    method: { type: String, default: 'mpesa' },
    payerPhone: String,
    paidTo: String,
    mpesaReceipt: String,
    callbackAt: Date,
    raw: Object
  }
}, { timestamps: true });

module.exports = mongoose.model('orders', orderSchema);
