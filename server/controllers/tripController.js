const Trip = require("../models/trip");
const Rider = require("../models/rider");

// Create a new trip
exports.createTrip = async (req, res) => {
  try {
    const { rider_id, user_id, startLocation, endLocation, distanceKm, fare } = req.body;

    const trip = new Trip({
      rider_id,
      user_id,
      startLocation,
      endLocation,
      distanceKm,
      fare,
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    console.error("Error creating trip:", err);
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
