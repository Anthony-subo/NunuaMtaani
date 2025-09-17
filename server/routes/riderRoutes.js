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
  updateLocation,
  getRiderByUserId   // ✅ add this
} = require("../controllers/riderController");

// Rider CRUD
router.post("/", createRider);
router.get("/", getRiders);
router.delete("/:id", deleteRider);

// ✅ Get rider by user id
router.get("/me/:userId", getRiderByUserId);   // new route

// Rider services
router.get("/nearby", getNearbyRiders);

// Update live location
router.put("/:id/location", updateLocation);

// Trips
router.post("/trips/start", startTrip);
router.post("/trips/complete/:tripId", completeTrip);
router.get("/:riderId/trips", getRiderTrips);
router.get("/:riderId/earnings", getRiderEarnings);

module.exports = router;
