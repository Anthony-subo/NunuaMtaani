const express = require("express");
const router = express.Router();
const { createTrip, completeTrip } = require("../controllers/tripController");

router.post("/", createTrip);          // Create new trip
router.put("/:id/complete", completeTrip); // Mark trip as completed + update earnings

module.exports = router;
