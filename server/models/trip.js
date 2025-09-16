const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "orders", required: true },
  rider_id: { type: mongoose.Schema.Types.ObjectId, ref: "riders", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: "shops", required: true },

  startLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  endLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }
  },

  distanceKm: { type: Number, required: true },
  fare: { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("trips", tripSchema);
