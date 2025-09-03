// models/Shop.js
const mongoose = require('mongoose');

// ================== SUBSCRIPTION SCHEMA ==================
const SubscriptionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['active', 'grace', 'inactive'],
      default: 'inactive'
    },
    plan: {
      type: String,
      default: 'standard-300' // can support future tiers later
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,   // last paid date (monthly subscription)
    graceUntil: Date,         // optional grace days (3–7 days after expiry)
    lastPaymentRef: String    // Mpesa ref or manual note
  },
  { _id: false }
);

// ================== SHOP SCHEMA ==================
const ShopSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    shop_name: { type: String, required: true },
    owner_name: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },

    // Payment setup (phone or till)
    payment_method: {
      type: String,
      enum: ['phone', 'till'],
      required: true
    },
    payment_number: {
      type: String,
      required: true // 2547XXXXXXXX or Till Number
    },

    // Commission logic
    commission_rate: { type: Number, default: 0.05 }, // 5%

    // Subscription
    subscription: {
      type: SubscriptionSchema,
      default: () => ({})
    },

    // Visibility toggle
    isVisible: {
      type: Boolean,
      default: false // inactive shops won’t show in marketplace
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shop', ShopSchema);
