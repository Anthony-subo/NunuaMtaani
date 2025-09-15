const Rider = require('../models/rider');

// Create rider
exports.createRider = async (req, res) => {
  try {
    const rider = new Rider(req.body);
    await rider.save();
    res.status(201).json(rider);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all riders
exports.getRiders = async (req, res) => {
  try {
    const riders = await Rider.find().populate('user_id', 'name email role');
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete rider
exports.deleteRider = async (req, res) => {
  try {
    await Rider.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rider deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🚲 Nearby riders (placeholder for now)
exports.getNearbyRiders = (req, res) => {
  res.send("Nearby riders");
};

// 🚕 Start trip (placeholder for now)
exports.startTrip = (req, res) => {
  res.send("Trip started");
};

// ✅ Complete trip (placeholder for now)
exports.completeTrip = (req, res) => {
  res.send("Trip completed");
};

// 📦 Rider trips (placeholder for now)
exports.getRiderTrips = (req, res) => {
  res.send("Rider trips");
};

// 💵 Rider earnings (placeholder for now)
exports.getRiderEarnings = (req, res) => {
  res.send("Rider earnings");
};
