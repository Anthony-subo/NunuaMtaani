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
