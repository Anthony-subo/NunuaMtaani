import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/earnings.css";

const API_URL = import.meta.env.VITE_API_URL;

function RiderEarnings({ riderId }) {
  const [earnings, setEarnings] = useState({
    totalTrips: 0,
    totalKm: 0,
    totalPay: 0,
    pendingPay: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!riderId) return; // wait for riderId to be set from dashboard

    axios
      .get(`${API_URL}/api/riders/${riderId}/earnings`)
      .then((res) => {
        setEarnings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching earnings:", err);
        setError("⚠️ Failed to load earnings data.");
        setLoading(false);
      });
  }, [riderId]);

  if (loading) return <p className="text-center mt-3">⏳ Loading earnings...</p>;
  if (error) return <p className="text-danger text-center">{error}</p>;

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
