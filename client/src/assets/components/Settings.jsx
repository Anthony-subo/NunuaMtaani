import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/settings.css";

const API_URL = import.meta.env.VITE_API_URL; // ✅ your API base URL

function Settings() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
    location: "",
    coordinates: [0, 0], // [lng, lat]
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    // Load saved settings from backend
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/settings/${user._id}`);
        if (res.data.settings) {
          setFormData({
            ...formData,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            location: res.data.settings.location || "",
            coordinates: res.data.settings.geo?.coordinates || [0, 0],
          });
        } else {
          // fallback → just user info if no settings yet
          setFormData({
            ...formData,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
          });
        }
      } catch (err) {
        console.error("⚠️ Failed to load settings", err);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const res = await axios.put(
        `${API_URL}/api/settings/${user._id}`,
        formData
      );

      alert("✅ Settings updated!");
      setFormData({
        ...formData,
        location: res.data.settings.location,
        coordinates: res.data.settings.geo?.coordinates || [0, 0],
      });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update settings");
    }
  };

  return (
    <div className="settings-container">
      <form onSubmit={handleSubmit} className="settings-form">
        <h3 className="settings-title">⚙️ Profile Settings</h3>
        <p className="settings-subtext">
          Update your details below. Location will be used for shop/rider/buyer
          matching.
        </p>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
            placeholder="Enter your location (e.g. Nairobi, Bahati)"
          />
        </div>

        <div className="form-group">
          <label>Email (read-only)</label>
          <input type="email" value={formData.email || ""} disabled />
        </div>

        <div className="form-group">
          <label>Role (read-only)</label>
          <input type="text" value={formData.role || ""} disabled />
        </div>

        <button type="submit" className="save-btn">
          💾 Save Changes
        </button>
      </form>
    </div>
  );
}

export default Settings;
