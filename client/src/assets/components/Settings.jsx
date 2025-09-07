import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/settings.css"; // ✅ we'll add custom styles

function Settings() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    email: "",
    status: ""
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setFormData(user);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const res = await axios.put(`/api/users/settings/${user._id}`, formData);
      alert("Profile updated!");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setFormData(res.data.user);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="settings-container">
      <form onSubmit={handleSubmit} className="settings-form">
        <h3 className="settings-title">⚙️ Profile Settings</h3>
        <p className="settings-subtext">
          Update your personal details below. <br />
          (Email and status cannot be changed)
        </p>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
            placeholder="Enter your location"
          />
        </div>

        <div className="form-group">
          <label>Email (read-only)</label>
          <input type="email" value={formData.email || ""} disabled />
        </div>

        <div className="form-group">
          <label>Status (read-only)</label>
          <input type="text" value={formData.status || ""} disabled />
        </div>

        <button type="submit" className="save-btn">
          💾 Save Changes
        </button>
      </form>
    </div>
  );
}

export default Settings;
