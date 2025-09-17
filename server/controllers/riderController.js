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
// 🚀 Get rider by user_id
exports.getRiderByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const rider = await Rider.findOne({ user_id: userId }).populate("user_id", "name email role");
    if (!rider) return res.status(404).json({ error: "Rider not found" });
    res.json(rider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get riders (optionally filter by userId)
exports.getRiders = async (req, res) => {
  try {
    if (req.query.userId) {
      // fetch rider(s) for a specific user
      const rider = await Rider.find({ user_id: req.query.userId }).populate(
        "user_id",
        "name email role"
      );
      return res.json(rider);
    }

    // default: return all riders
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
// riderController.js
// riderController.js
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const rider = await Rider.findByIdAndUpdate(
      req.params.id,
      {
        location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!rider) return res.status(404).json({ error: "Rider not found" });
    res.json(rider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


