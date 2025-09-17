const express = require("express");
const router = express.Router();
const { startTrip, completeTrip, getRiderTrips } = require("../controllers/tripController");

// Create trip
router.post("/start", startTrip);

// Complete trip
router.put("/:id/complete", completeTrip);

// Get all trips for a rider
router.get("/rider/:riderId", getRiderTrips);

module.exports = router;
