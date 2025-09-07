const User = require('../models/users');

// @desc Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// @desc Delete user by ID
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error while deleting user' });
  }
};

// @desc Update user role by ID
const updateUserRole = async (req, res) => {
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
};

// @desc Update user settings (except email & status)
const updateUserSettings = async (req, res) => {
  try {
    const userId = req.params.id;

    // Destructure to exclude email & status
    const { email, status, ...allowedUpdates } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password from response

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User settings updated", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user settings" });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  updateUserRole,
  updateUserSettings, // ✅ add this
};
