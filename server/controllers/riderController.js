const Rider = require("../models/rider");
const Trip = require("../models/trip");

// Create Rider
exports.createRider = async (req, res) => {
  try {
    const rider = new Rider(req.body);
    await rider.save();
    res.status(201).json(rider);
  } catch (err) {
    console.error("Error creating rider:", err);
    res.status(500).json({ message: "Failed to create rider" });
  }
};

// Get All Riders
exports.getRiders = async (req, res) => {
  try {
    const riders = await Rider.find();
    res.json(riders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch riders" });
  }
};

// Delete Rider
exports.deleteRider = async (req, res) => {
  try {
    await Rider.findByIdAndDelete(req.params.id);
    res.json({ message: "Rider deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete rider" });
  }
};

// Get Nearby Riders (Geo search)
exports.getNearbyRiders = async (req, res) => {
  const { lng, lat, radius } = req.query;
  try {
    const riders = await Rider.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius) || 5000 // 5km default
        }
      },
      isAvailable: true
    });
    res.json(riders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch nearby riders" });
  }
};

// Start Trip
exports.startTrip = async (req, res) => {
  try {
    const trip = new Trip(req.body);
    await trip.save();

    // mark rider unavailable
    await Rider.findByIdAndUpdate(trip.rider_id, { isAvailable: false });

    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: "Failed to start trip" });
  }
};

// Complete Trip
exports.completeTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    trip.status = "completed";
    await trip.save();

    const rider = await Rider.findById(trip.rider_id);
    if (rider) {
      rider.bikerData.totalTrips += 1;
      rider.bikerData.totalKm += trip.distanceKm;
      rider.bikerData.totalPay += trip.fare;
      rider.bikerData.pendingPay += trip.fare;
      rider.isAvailable = true; // back to available
      await rider.save();
    }

    res.json({ message: "Trip completed", trip, bikerData: rider?.bikerData });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete trip" });
  }
};

// Get Rider Trips
exports.getRiderTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ rider_id: req.params.riderId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trips" });
  }
};

// Get Rider Earnings
exports.getRiderEarnings = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.riderId);
    if (!rider) return res.status(404).json({ message: "Rider not found" });
    res.json(rider.bikerData);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch earnings" });
  }
};
