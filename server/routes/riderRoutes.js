const express = require("express");
const router = express.Router();
const riderController = require("../controllers/riderController");

// Rider CRUD
router.post("/", riderController.createRider);
router.get("/", riderController.getRiders);
router.delete("/:id", riderController.deleteRider);

// Get rider by user id
router.get("/me/:userId", riderController.getRiderByUserId);

// Rider services
router.get("/nearby", riderController.getNearbyRiders);

// ✅ Update live location by Mongo _id
router.put("/:id/location", riderController.updateLocation);

// Trips
router.post("/trips/start", riderController.startTrip);
router.post("/trips/complete/:tripId", riderController.completeTrip);
router.get("/:riderId/trips", riderController.getRiderTrips);
router.get("/:riderId/earnings", riderController.getRiderEarnings);

module.exports = router;
