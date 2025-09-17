// controllers/tripController.js
const Trip = require("../models/trip");
const Rider = require("../models/rider");
const Order = require("../models/orders"); // ensure this exists

// ✅ Create a trip when assigning rider
exports.startTrip = async (req, res) => {
  try {
    const { orderId, riderId, userId, shopId, startLocation, endLocation, distanceKm, fare } = req.body;

    if (!orderId || !riderId || !userId || !shopId || !startLocation || !endLocation) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const trip = new Trip({
      order_id: orderId,
      rider_id: riderId,
      user_id: userId,
      shop_id: shopId,
      startLocation,
      endLocation,
      distanceKm,
      fare,
    });

    await trip.save();

    // Optionally mark the order as "assigned"
    await Order.findByIdAndUpdate(orderId, { status: "assigned", assignedRider: riderId });

    res.status(201).json({ message: "Trip started", trip });
  } catch (err) {
    console.error("Error starting trip:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark trip as completed and update rider earnings
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

    res.json({ message: "Trip completed", trip, bikerData: rider?.bikerData });
  } catch (err) {
    console.error("Error completing trip:", err);
    res.status(500).json({ message: "Server error" });
  }
};
