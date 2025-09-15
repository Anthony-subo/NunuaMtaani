const Rider = require("../models/rider");
const Trip = require("../models/trip");
const { v4: uuidv4 } = require("uuid");

// ✅ Create rider
exports.createRider = async (req, res) => {
  try {
    const data = req.body;

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

// ✅ Get all riders
exports.getRiders = async (req, res) => {
  try {
    const riders = await Rider.find().populate("user_id", "name email role");
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete rider
exports.deleteRider = async (req, res) => {
  try {
    await Rider.findByIdAndDelete(req.params.id);
    res.json({ message: "Rider deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update rider live location
exports.updateLocation = async (req, res) => {
  try {
    const { riderId } = req.params;
    const { lng, lat } = req.body;

    const rider = await Rider.findByIdAndUpdate(
      riderId,
      {
        $set: {
          location: { type: "Point", coordinates: [lng, lat] },
        },
      },
      { new: true }
    );

    if (!rider) return res.status(404).json({ error: "Rider not found" });

    res.json(rider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Nearby riders (within 5km)
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

// ✅ Start trip
exports.startTrip = async (req, res) => {
  try {
    const { rider_id, user_id, startLocation, endLocation, distanceKm, fare } = req.body;

    const trip = new Trip({
      rider_id,
      user_id,
      startLocation,
      endLocation,
      distanceKm,
      fare,
      status: "pending",
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Complete trip
exports.completeTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { status: "completed" },
      { new: true }
    );

    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // Update rider earnings
    await Rider.findByIdAndUpdate(trip.rider_id, {
      $inc: {
        "bikerData.totalTrips": 1,
        "bikerData.totalKm": trip.distanceKm,
        "bikerData.totalPay": trip.fare,
        "bikerData.pendingPay": trip.fare,
      },
    });

    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all trips for rider
exports.getRiderTrips = async (req, res) => {
  try {
    const { riderId } = req.params;
    const trips = await Trip.find({ rider_id: riderId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Rider earnings
exports.getRiderEarnings = async (req, res) => {
  try {
    const { riderId } = req.params;
    const rider = await Rider.findById(riderId);

    if (!rider) return res.status(404).json({ error: "Rider not found" });

    res.json(rider.bikerData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
