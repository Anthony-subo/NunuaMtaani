const Rider = require("../models/rider");
const { v4: uuidv4 } = require("uuid");

// Create rider
exports.createRider = async (req, res) => {
  try {
    const data = req.body;

    // generate unique rider_id
    const rider = new Rider({
      ...data,
      rider_id: "RDR-" + uuidv4().slice(0, 8),
    });

    await rider.save();
    res.status(201).json(rider);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all riders
exports.getRiders = async (req, res) => {
  try {
    const riders = await Rider.find().populate("user_id", "name email role");
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete rider
exports.deleteRider = async (req, res) => {
  try {
    await Rider.findByIdAndDelete(req.params.id);
    res.json({ message: "Rider deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🚲 Nearby riders (within 5km)
exports.getNearbyRiders = async (req, res) => {
  try {
    const { lng, lat } = req.query;
    const riders = await Rider.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 5000, // 5km
        },
      },
      isAvailable: true,
    });
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🚕 Start trip
exports.startTrip = (req, res) => {
  res.send("Trip started");
};

// ✅ Complete trip
exports.completeTrip = (req, res) => {
  res.send("Trip completed");
};

// 📦 Rider trips
exports.getRiderTrips = (req, res) => {
  res.send("Rider trips");
};

// 💵 Rider earnings
exports.getRiderEarnings = (req, res) => {
  res.send("Rider earnings");
};
