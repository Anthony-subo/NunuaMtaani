const mongoose = require("mongoose");

// ================== SUBSCRIPTION SCHEMA ==================
const SubscriptionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["active", "grace", "inactive"],
      default: "inactive"
    },
    plan: {
      type: String,
      default: "standard-300"
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    graceUntil: Date,
    lastPaymentRef: String
  },
  { _id: false }
);

// ================== SHOP SCHEMA ==================
const ShopSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    shop_name: { type: String, required: true },
    owner_name: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },

    payment_method: {
      type: String,
      enum: ["phone", "till"],
      required: true
    },
    payment_number: { type: String, required: true },

    commission_rate: { type: Number, default: 0.05 },

    subscription: {
      type: SubscriptionSchema,
      default: () => ({})
    },

    isVisible: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", ShopSchema);
