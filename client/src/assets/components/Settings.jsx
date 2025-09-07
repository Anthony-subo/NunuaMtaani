import React, { useState, useEffect } from "react";
import axios from "axios";

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
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="settings-form">
      <input
        type="text"
        name="name"
        value={formData.name || ""}
        onChange={handleChange}
        placeholder="Full Name"
      />
      <input
        type="text"
        name="phone"
        value={formData.phone || ""}
        onChange={handleChange}
        placeholder="Phone Number"
      />
      <input
        type="text"
        name="location"
        value={formData.location || ""}
        onChange={handleChange}
        placeholder="Location"
      />

      {/* Disabled fields */}
      <input type="email" value={formData.email || ""} disabled />
      <input type="text" value={formData.status || ""} disabled />

      <button type="submit">Save Changes</button>
    </form>
  );
}

export default Settings;
