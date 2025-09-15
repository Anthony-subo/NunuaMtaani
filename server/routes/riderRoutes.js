const express = require("express");
const router = express.Router();
const {
  createRider,
  getRiders,
  deleteRider,
  getNearbyRiders,
  startTrip,
  completeTrip,
  getRiderTrips,
  getRiderEarnings,
} = require("../controllers/riderController");

// Rider CRUD
router.post("/", createRider);
router.get("/", getRiders);
router.delete("/:id", deleteRider);

// Location & availability
router.get("/nearby", getNearbyRiders);

// Trips + earnings (rider perspective)
router.post("/trips/start", startTrip);
router.post("/trips/complete/:tripId", completeTrip);
router.get("/:riderId/trips", getRiderTrips);
router.get("/:riderId/earnings", getRiderEarnings);

module.exports = router;
