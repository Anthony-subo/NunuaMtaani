// server/controllers/authController.js
const bcrypt = require("bcrypt");
const UserModel = require("../models/users");

exports.register = async (req, res) => {
  const { name, phone, email, location, password, role } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name, phone, email, location, password: hashedPassword, role,
    });

    res.status(201).json({ status: "success", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err });
  }
  
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    res.json({ status: "success", user });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err });
  }
};
