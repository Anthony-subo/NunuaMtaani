const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  rider_id: { type: String, unique: true, required: true },
  isAvailable: { type: Boolean, default: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  }
}, { timestamps: true });

riderSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("riders", riderSchema);
