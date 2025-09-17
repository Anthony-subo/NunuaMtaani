// routes/tripRoutes.js
const express = require("express");
const router = express.Router();
const { startTrip, completeTrip } = require("../controllers/tripController");

// Create trip when assigning rider
router.post("/start", startTrip);

// Complete trip
router.put("/:id/complete", completeTrip);

module.exports = router;
