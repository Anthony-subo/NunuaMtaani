const express = require("express");
const router = express.Router();
const riderController = require("../controllers/riderController");

// CRUD
router.post("/", riderController.createRider);
router.get("/", riderController.getRiders);
router.delete("/:id", riderController.deleteRider);

// Get rider by user ID
router.get("/me/:userId", riderController.getRiderByUserId);

// Nearby riders (GeoJSON search)
router.get("/nearby", riderController.getNearbyRiders);

// ✅ Update live location
router.put("/:id/location", riderController.updateLocation);

// Earnings & Trips
router.get("/:riderId/earnings", riderController.getRiderEarnings);
router.post("/trips/start", riderController.startTrip);
router.post("/trips/complete/:tripId", riderController.completeTrip);
router.get("/:riderId/trips", riderController.getRiderTrips);

module.exports = router;
