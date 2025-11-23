const express = require('express');
const router = express.Router();
const User = require('../models/users'); // ✅ import User model
const {
  getAllUsers,
  deleteUser,
  updateUserRole,
  updateUserSettings,
} = require('../controllers/userController');

// Routes
router.get('/', getAllUsers);
router.delete('/:id', deleteUser);
router.patch('/:id', updateUserRole);

// ✅ Settings route
router.put('/settings/:id', updateUserSettings);

// ✅ Get all riders
router.get("/riders", async (req, res) => {
  try {
    const riders = await User.find({ role: "rider" });
    res.json(riders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching riders" });
  }
});

module.exports = router;
