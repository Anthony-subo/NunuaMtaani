const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, unique: true, required: true },
  location: { type: String },
  role: { type: String, enum: ['buyer', 'seller', 'admin', 'rider'], default: 'buyer' },
  password: { type: String, required: true }
}, { timestamps: true });

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
