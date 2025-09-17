// routes/tripRoutes.js
const express = require("express");
const router = express.Router();
const { startTrip, completeTrip } = require("../controllers/tripController");

router.post("/start", startTrip);          // assign rider + create trip
router.put("/:id/complete", completeTrip); // complete trip

module.exports = router;
