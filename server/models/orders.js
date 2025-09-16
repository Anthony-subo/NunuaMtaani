const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },

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
    amount: Number,
    callbackAt: Date,
    raw: Object
  },

  // 🚚 Rider assignment
  delivery: {
    rider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'riders' },
    code: String,  // Verification code
    status: { type: String, enum: ['not_assigned', 'assigned', 'delivered'], default: 'not_assigned' }
  }
}, { timestamps: true });

module.exports = mongoose.model('orders', orderSchema);
