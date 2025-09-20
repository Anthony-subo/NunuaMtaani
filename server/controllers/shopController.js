const Shop = require("../models/shop");

// @desc Create a new shop linked to a user
const createShop = async (req, res) => {
  try {
    const {
      shop_name,
      owner_name,
      email,
      location,
      user_id,
      payment_method,
      payment_number,
      commission_rate
    } = req.body;

    if (!shop_name || !owner_name || !email || !location || !user_id || !payment_method || !payment_number) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    if (!["phone", "till"].includes(payment_method)) {
      return res.status(400).json({ message: "Invalid payment method. Must be 'phone' or 'till'." });
    }

    const newShop = new Shop({
      shop_name,
      owner_name,
      email,
      location,
      user_id,
      payment_method,
      payment_number,
      commission_rate: commission_rate || 0.05
    });

    await newShop.save();
    res.status(201).json(newShop);
  } catch (err) {
    console.error("Shop creation error:", err);
    res.status(500).json({ message: "Error creating shop", error: err.message });
  }
};

// @desc Get shop by user ID
const getShopByUserId = async (req, res) => {
  try {
    const shop = await Shop.findOne({ user_id: req.params.userId });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json({ shop });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc Get all shops
const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find();
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shops" });
  }
};

// @desc Delete shop by ID
const deleteShop = async (req, res) => {
  try {
    const deleted = await Shop.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Shop not found" });
    res.json({ message: "Shop deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete shop", error: err.message });
  }
};

// @desc Update shop subscription status
const updateShopStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["active", "grace", "inactive"];
    if (!valid.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const updatedShop = await Shop.findByIdAndUpdate(
      req.params.shopId,
      { "subscription.status": status },
      { new: true }
    );

    if (!updatedShop) return res.status(404).json({ message: "Shop not found" });
    res.json(updatedShop);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
};

module.exports = {
  createShop,
  getShopByUserId,
  getAllShops,
  deleteShop,
  updateShopStatus
};
