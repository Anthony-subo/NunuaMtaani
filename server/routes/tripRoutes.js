const express = require("express");
const router = express.Router();
const { createTrip, completeTrip } = require("../controllers/tripController");

// Trips (system perspective)
router.post("/", createTrip);            // Create new trip
router.put("/:id/complete", completeTrip); // Complete trip + update bikersData

module.exports = router;
