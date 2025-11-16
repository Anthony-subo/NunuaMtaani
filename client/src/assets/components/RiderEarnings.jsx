import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/earnings.css";

const API_URL = import.meta.env.VITE_API_URL;

function RiderEarnings() {
  const [earnings, setEarnings] = useState({
    totalTrips: 0,
    totalKm: 0,
    totalPay: 0,
    pendingPay: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "rider") {
      setLoading(false);
      return;
    }

    // 1️⃣ Get rider using the user ID stored in database
    axios
      .get(`${API_URL}/api/riders/user/${user._id}`)
      .then((res) => {
        const riderData = res.data;

        // If backend returns an array, take the first item
        const rider = Array.isArray(riderData) ? riderData[0] : riderData;

        if (!rider) {
          console.error("No rider found for this user.");
          setLoading(false);
          return;
        }

        const riderId = rider._id; // THIS is the correct rider ID (68f4f040683953e880349f6e)

        // 2️⃣ Fetch earnings using REAL riderId
        return axios.get(`${API_URL}/api/riders/${riderId}/earnings`);
      })
      .then((res) => {
        if (res) setEarnings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching earnings:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="loading-text">Loading earnings...</p>;

  return (
    <div className="earnings-container">
      <h3 className="mb-3">💰 My Earnings</h3>

      <div className="earnings-stats">
        <div className="card">
          <h4>{earnings.totalTrips}</h4>
          <p>Trips Completed</p>
        </div>

        <div className="card">
          <h4>{earnings.totalKm.toFixed(2)} km</h4>
          <p>Total Distance</p>
        </div>

        <div className="card">
          <h4>KES {earnings.totalPay.toFixed(2)}</h4>
          <p>Total Earnings</p>
        </div>

        <div className="card pending">
          <h4>KES {earnings.pendingPay.toFixed(2)}</h4>
          <p>Pending Payout</p>
        </div>
      </div>
    </div>
  );
}

export default RiderEarnings;
