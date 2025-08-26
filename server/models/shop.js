const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  shop_name: { type: String, required: true },
  owner_name: { type: String, required: true },
  email: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

const ShopModel = mongoose.model('shops', ShopSchema);
module.exports = ShopModel;
