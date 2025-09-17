const Trip = require("../models/trip");
const Rider = require("../models/rider");
const Order = require("../models/orders");

// Start a trip (buyer assigns rider)
exports.startTrip = async (req, res) => {
  try {
    const {
      orderId,
      riderId,
      userId,
      shopId,
      startLocation,
      endLocation,
      distanceKm,
      fare,
    } = req.body;

    if (!orderId || !riderId || !userId || !shopId || !startLocation || !endLocation) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const trip = new Trip({
      order_id: orderId,
      rider_id: riderId,
      user_id: userId,
      shop_id: shopId,
      startLocation: {
        type: "Point",
        coordinates: [startLocation.lng, startLocation.lat],
      },
      endLocation: {
        type: "Point",
        coordinates: [endLocation.lng, endLocation.lat],
      },
      distanceKm,
      fare,
    });

    await trip.save();

    // Update order status
    await Order.findByIdAndUpdate(orderId, {
      status: "assigned",
      assignedRider: riderId,
    });

    res.status(201).json({ message: "Trip started", trip });
  } catch (err) {
    console.error("Error starting trip:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Complete trip
exports.completeTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.status !== "pending") {
      return res.status(400).json({ message: "Trip already closed" });
    }

    trip.status = "completed";
    await trip.save();

    // Update rider earnings instead of bikerData
    const rider = await Rider.findById(trip.rider_id);
    if (rider) {
      rider.earnings.totalTrips += 1;
      rider.earnings.totalKm += trip.distanceKm;
      rider.earnings.totalPay += trip.fare;
      rider.earnings.pendingPay += trip.fare;
      await rider.save();
    }

    res.json({ message: "Trip completed", trip, earnings: rider?.earnings });
  } catch (err) {
    console.error("Error completing trip:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all trips for a rider
exports.getRiderTrips = async (req, res) => {
  try {
    const { riderId } = req.params;
    const trips = await Trip.find({ rider_id: riderId }).sort({ createdAt: -1 });

    res.json(trips);
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ message: "Server error" });
  }
};
