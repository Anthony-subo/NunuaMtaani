import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/earnings.css";

const API_URL = import.meta.env.VITE_API_URL; // backend URL

function RiderEarnings() {
  const [earnings, setEarnings] = useState({
    totalTrips: 0,
    totalKm: 0,
    totalPay: 0,
    pendingPay: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch rider ID from localStorage
  const riderId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        if (!riderId) {
          setError("No rider ID found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_URL}/api/riders/${riderId}/earnings`);
        setEarnings(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load earnings.");
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [riderId]);

  if (loading) return <div className="earnings-loading">Loading earnings...</div>;
  if (error) return <div className="earnings-error">{error}</div>;

  return (
    <div className="earnings-container">
      <h2 className="earnings-title">Rider Earnings Overview</h2>

      <div className="earnings-grid">
        <div className="earnings-card">
          <h3>Total Trips</h3>
          <p>{earnings.totalTrips}</p>
        </div>

        <div className="earnings-card">
          <h3>Total Kilometers</h3>
          <p>{earnings.totalKm} km</p>
        </div>

        <div className="earnings-card">
          <h3>Total Earnings</h3>
          <p>Ksh {earnings.totalPay.toLocaleString()}</p>
        </div>

        <div className="earnings-card pending">
          <h3>Pending Payment</h3>
          <p>Ksh {earnings.pendingPay.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default RiderEarnings;
