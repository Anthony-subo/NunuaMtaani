// routes/settingsRoutes.js
const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");

router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { location, coordinates } = req.body;

    const updated = await Settings.findOneAndUpdate(
      { user_id: userId },
      { location, geo: { type: "Point", coordinates } },
      { upsert: true, new: true }
    );

    res.json({ success: true, settings: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

module.exports = router;
