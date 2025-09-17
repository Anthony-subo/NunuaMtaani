// routes/tripRoutes.js
const express = require("express");
const router = express.Router();
const { createTrip, completeTrip, startTrip } = require("../controllers/tripController");

router.post("/", createTrip);             // raw create trip
router.post("/start", startTrip);         // ✅ assign rider + create trip
router.put("/:id/complete", completeTrip);

module.exports = router;

