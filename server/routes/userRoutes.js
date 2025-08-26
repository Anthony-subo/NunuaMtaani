const express = require('express');
const router = express.Router();
const User = require('../models/users');

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

// DELETE user by ID
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error while deleting user' });
  }
});

// PATCH user role by ID
router.patch('/:id', async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['buyer', 'seller', 'admin', 'rider'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router;
