// models/Shop.js
const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  status: { type: String, enum: ['active','grace','inactive'], default: 'inactive' },
  plan: { type: String, default: 'standard-300' },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,          // end of paid month (EAT)
  graceUntil: Date,                // optional 3–7 days after periodEnd
  lastPaymentRef: String           // mpesa ref or manual note
}, { _id: false });

const ShopSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shop_name: { type: String, required: true },
  payment_method: { type: String, enum: ['phone','till'], required: true },
  payment_number: { type: String, required: true }, // 2547XXXXXXXX or TILL
  commission_rate: { type: Number, default: 0.05 },
  subscription: { type: SubscriptionSchema, default: () => ({}) },
  isVisible: { type: Boolean, default: false },     // flip false when inactive/unpaid
}, { timestamps: true });

module.exports = mongoose.model('Shop', ShopSchema);
