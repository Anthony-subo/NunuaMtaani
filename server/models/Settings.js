// models/Settings.js
const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    role: { type: String, enum: ["buyer", "seller", "admin", "rider"], required: true },
    location: { type: String }, // for text addresses
    geo: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    isStatic: { type: Boolean, default: false }, // 🏪 shop = true, user/rider = false
  },
  { timestamps: true }
);

settingSchema.index({ geo: "2dsphere" });

module.exports = mongoose.model("settings", settingSchema);
