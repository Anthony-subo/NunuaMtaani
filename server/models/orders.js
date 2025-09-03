// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // Who placed the order
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Which shop (1 seller per order)
  sellerShop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },

  // Items in the order
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,        // snapshot name
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
      image: String,
      location: String
    }
  ],

  // Total price for this order
  total: { type: Number, required: true },

  // Order status
  status: {
    type: String,
    enum: ['pending', 'paid', 'deliver', 'completed', 'cancelled', 'failed'],
    default: 'pending'
  },

  // Payment details
  payment: {
    method: { type: String, default: 'mpesa' }, // mpesa, cash, card
    payerPhone: String,   // 2547...
    paidTo: String,       // seller phone/till
    mpesaReceipt: String, // reference code
    callbackAt: Date,     // when Safaricom callback received
    raw: Object           // full payload from M-Pesa callback
  }

}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
