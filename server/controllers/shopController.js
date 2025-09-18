const axios = require('axios');
const Shop = require('../models/shop');

// helper: geocode string -> [lng, lat]
async function geocodeAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await axios.get(url, { headers: { "User-Agent": "NunuaMtaani" } });

    if (res.data.length > 0) {
      return [parseFloat(res.data[0].lon), parseFloat(res.data[0].lat)];
    }
  } catch (err) {
    console.error("Geocoding failed:", err.message);
  }
  return [0, 0]; // fallback
}

const createShop = async (req, res) => {
  try {
    const { shop_name, owner_name, email, location, user_id, payment_method, payment_number, commission_rate } = req.body;

    if (!shop_name || !owner_name || !email || !location || !user_id || !payment_method || !payment_number) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    if (!['phone', 'till'].includes(payment_method)) {
      return res.status(400).json({ message: "Invalid payment method. Must be 'phone' or 'till'." });
    }

    // 🔥 Convert "Bahati" to coordinates
    const coords = await geocodeAddress(location);

    const newShop = new Shop({
      shop_name,
      owner_name,
      email,
      location,
      geoLocation: { type: "Point", coordinates: coords },
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
