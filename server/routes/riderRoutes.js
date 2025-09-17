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

// Rider services
router.get("/nearby", getNearbyRiders);

// Trips
router.post("/trips/start", startTrip);          
router.post("/trips/complete/:tripId", completeTrip); 
router.get("/:riderId/trips", getRiderTrips);    
router.get("/:riderId/earnings", getRiderEarnings); 
// routes/riderRoutes.js
router.put("/:id/location", updateLocation);

module.exports = router;
