// routes/tripRoutes.js
const express = require("express");
const router = express.Router();
const { startTrip, completeTrip } = require("../controllers/tripController");

// create + assign rider
router.post("/start", startTrip);

// complete a trip
router.put("/:id/complete", completeTrip);

module.exports = router;
