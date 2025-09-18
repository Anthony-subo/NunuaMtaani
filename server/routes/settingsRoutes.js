const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");

// 🟢 Get user settings
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = await Settings.findOne({ user_id: userId });
    if (!settings) {
      return res.status(404).json({ message: "No settings found" });
    }
    res.json({ success: true, settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// 🟢 Update settings
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { location, coordinates } = req.body;

    const updated = await Settings.findOneAndUpdate(
      { user_id: userId },
      {
        location,
        geo: { type: "Point", coordinates: coordinates || [0, 0] },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, settings: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

module.exports = router;
