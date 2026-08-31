const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users', 
    required: true,
    index: true 
  },
  sellerShop: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shop', 
    required: true,
    index: true 
  },
  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
      quantity: { type: Number, required: true, min: 1 },
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      image: String,
      location: String
    }
  ],
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'paid', 'deliver', 'completed', 'cancelled', 'failed'],
    default: 'pending',
    index: true
  },
  payment: {
    method: { type: String, default: 'mpesa' },
    payerPhone: String,
    paidTo: String,
    mpesaReceipt: String,
    amount: Number,
    callbackAt: Date,
    raw: { type: mongoose.Schema.Types.Mixed, default: {} }
  }
}, { timestamps: true });

// Alias for frontend compatibility
orderSchema.virtual('shop_id')
  .get(function() { return this.sellerShop; })
  .set(function(v) { this.sellerShop = v; });

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// Indexes for fast callbacks and cron aggregations
orderSchema.index({ 'payment.raw.CheckoutRequestID': 1 });
orderSchema.index({ sellerShop: 1, status: 1, createdAt: 1 });

module.exports = mongoose.model('orders', orderSchema);