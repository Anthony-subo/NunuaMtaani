const express = require('express');
const router = express.Router();
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

module.exports = router;
