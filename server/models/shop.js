// models/Shop.js
const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['active', 'grace', 'inactive'],
    default: 'inactive'
  },
  plan: { type: String, default: 'standard-300' },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  graceUntil: Date,
  lastPaymentRef: String
}, { _id: false });

const ShopSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  shop_name: { type: String, required: true },
  owner_name: { type: String, required: true },
  email: { type: String, required: true },
  
  // keep plain text for display
  location: { type: String, required: true },

  // NEW field: GeoJSON for geo queries
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0]
    }
  },

  payment_method: {
    type: String,
    enum: ['phone', 'till'],
    required: true
  },
  payment_number: { type: String, required: true },

  commission_rate: { type: Number, default: 0.05 },

  subscription: {
    type: SubscriptionSchema,
    default: () => ({})
  },

  isVisible: { type: Boolean, default: false }
}, { timestamps: true });

ShopSchema.index({ geoLocation: '2dsphere' }); // ✅ for near queries

module.exports = mongoose.model('Shop', ShopSchema);
