// models/rider.js
const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },

    rider_id: { type: String, unique: true, required: true }, // generated unique rider code
    rider_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    vehicle_type: { type: String, enum: ["bike", "car"], required: true },
    license_number: { type: String, required: true },
    payment_number: { type: String, required: true },

    isAvailable: { type: Boolean, default: true },

    // 🌍 GeoJSON + raw lat/lng
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  { timestamps: true }
);

riderSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("riders", riderSchema);
