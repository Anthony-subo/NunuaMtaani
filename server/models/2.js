// models/Order.js  (1 order = 1 seller; split multi-seller carts into multiple orders)
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerShop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    qty: Number,
    price: Number
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending','paid','failed','cancelled'], default: 'pending' },
  payment: {
    method: { type: String, default: 'mpesa' },
    payerPhone: String,            // 2547...
    paidTo: String,                // seller phone or till
    mpesaReceipt: String,
    callbackAt: Date,
    raw: Object
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
