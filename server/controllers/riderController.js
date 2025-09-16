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

exports.completeTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.status !== "pending") {
      return res.status(400).json({ message: "Trip already closed" });
    }

    // Mark as completed
    trip.status = "completed";
    await trip.save();

    // Update Rider earnings
    const rider = await Rider.findById(trip.rider_id);
    if (rider) {
      rider.bikerData.totalTrips += 1;
      rider.bikerData.totalKm += trip.distanceKm;
      rider.bikerData.totalPay += trip.fare;
      rider.bikerData.pendingPay += trip.fare;
      await rider.save();
    }

    // Update Order status
    const order = await Order.findById(trip.order_id);
    if (order) {
      order.status = "delivered";
      await order.save();
    }

    res.json({ message: "Trip completed", trip, bikerData: rider?.bikerData, order });
  } catch (err) {
    console.error("Error completing trip:", err);
    res.status(500).json({ message: "Server error" });
  }
};
