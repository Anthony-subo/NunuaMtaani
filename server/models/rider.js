const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },

    rider_id: { type: String, unique: true, required: true },
    rider_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    vehicle_type: { type: String, enum: ["bike", "car"], required: true },
    license_number: { type: String, required: true },
    payment_number: { type: String, required: true },

    isAvailable: { type: Boolean, default: true },

    // ✅ GeoJSON location (for map & $near queries)
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [36.8219, -1.2921] }, // [lng, lat] Nairobi default
    },

    // 🟢 Earnings summary
    earnings: {
      totalTrips: { type: Number, default: 0 },
      totalKm: { type: Number, default: 0 },
      totalPay: { type: Number, default: 0 },
      pendingPay: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// ✅ Index for geo queries
riderSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("riders", riderSchema);
