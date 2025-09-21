const Rider = require("../models/rider");
const { v4: uuidv4 } = require("uuid");

// Create rider
exports.createRider = async (req, res) => {
  try {
    const data = req.body;

    const rider = new Rider({
      ...data,
      rider_id: "RDR-" + uuidv4().slice(0, 8),
      earnings: { totalTrips: 0, totalKm: 0, totalPay: 0, pendingPay: 0 }, // ✅ init earnings
    });

    await rider.save();
    res.status(201).json(rider);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get rider earnings
exports.getRiderEarnings = async (req, res) => {
  try {
    const { riderId } = req.params;
    const rider = await Rider.findOne({ user_id: riderId });
    if (!rider) return res.status(404).json({ error: "Rider not found" });
    res.json(rider.earnings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get rider by user_id
exports.getRiderByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const rider = await Rider.findOne({ user_id: userId }).populate(
      "user_id",
      "name email role"
    );

    if (!rider) return res.status(404).json({ error: "Rider not found" });
    res.json(rider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all riders
exports.getRiders = async (req, res) => {
  try {
    if (req.query.userId) {
      const rider = await Rider.find({ user_id: req.query.userId }).populate(
        "user_id",
        "name email role"
      );
      return res.json(rider);
    }

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

// Get nearby riders (within 5km)
exports.getNearbyRiders = async (req, res) => {
  try {
    const { lng, lat } = req.query;
    const riders = await Rider.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 5000,
        },
      },
      isAvailable: true,
    });
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Start trip
exports.startTrip = (req, res) => {
  res.send("Trip started");
};

// Complete trip
exports.completeTrip = (req, res) => {
  res.send("Trip completed");
};

// Rider trips
exports.getRiderTrips = (req, res) => {
  res.send("Rider trips");
};

// ✅ Update rider by rider_id (location + status)
exports.updateRiderByRiderId = async (req, res) => {
  try {
    const { rider_id } = req.params;
    const updateData = { ...req.body };

    if (req.body.lat && req.body.lng) {
      updateData.location = {
        type: "Point",
        coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)], // GeoJSON format
      };
    }

    const rider = await Rider.findOneAndUpdate(
      { rider_id },
      { $set: updateData },
      { new: true }
    );

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    res.json(rider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
