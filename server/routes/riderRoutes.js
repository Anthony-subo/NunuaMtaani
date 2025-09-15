const express = require("express");
const router = express.Router();
const {
  createRider,
  getNearbyRiders,
  startTrip,
  completeTrip,
  getRiderTrips,
  getRiderEarnings,
} = require("../controllers/riderController");

router.post("/", createRider);
router.get("/nearby", getNearbyRiders);
router.post("/trips/start", startTrip);
router.post("/trips/complete/:tripId", completeTrip);
router.get("/:riderId/trips", getRiderTrips);
router.get("/:riderId/earnings", getRiderEarnings);

module.exports = router;
