const Trip = require("../models/trip");
const Rider = require("../models/rider");

// 🚀 Start Trip (called when seller assigns a rider)
exports.startTrip = async (req, res) => {
  try {
    const {
      order_id,
      rider_id,
      user_id,
      shop_id,
      startLocation,
      endLocation,
      distanceKm,
      fare
    } = req.body;

    const trip = new Trip({
      order_id,
      rider_id,
      user_id,
      shop_id,
      startLocation,
      endLocation,
      distanceKm,
      fare,
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    console.error("Error starting trip:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Complete trip
exports.completeTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.status !== "pending") {
      return res.status(400).json({ message: "Trip already closed" });
    }

    trip.status = "completed";
    await trip.save();

    // Update rider earnings
    const rider = await Rider.findById(trip.rider_id);
    if (rider) {
      rider.bikerData.totalTrips += 1;
      rider.bikerData.totalKm += trip.distanceKm;
      rider.bikerData.totalPay += trip.fare;
      rider.bikerData.pendingPay += trip.fare;
      await rider.save();
    }

    res.json({ message: "Trip completed", trip, bikerData: rider?.bikerData });
  } catch (err) {
    console.error("Error completing trip:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📋 Get rider trips
exports.getRiderTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ rider_id: req.params.riderId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 💰 Get rider earnings summary
exports.getRiderEarnings = async (req, res) => {
  try {
    const trips = await Trip.find({ rider_id: req.params.riderId, status: "completed" });

    const totalTrips = trips.length;
    const totalKm = trips.reduce((sum, t) => sum + t.distanceKm, 0);
    const totalPay = trips.reduce((sum, t) => sum + t.fare, 0);
    const pendingPay = trips.reduce((sum, t) => sum + (t.status === "completed" ? t.fare : 0), 0);

    res.json({ totalTrips, totalKm, totalPay, pendingPay });
  } catch (err) {
    console.error("Error fetching earnings:", err);
    res.status(500).json({ message: "Server error" });
  }
};
