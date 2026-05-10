```jsx id="4s2hxp"
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/earnings.css";

const API_URL = import.meta.env.VITE_API_URL;

function RiderEarnings() {
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalKm: 0,
    totalPay: 0,
    pendingTrips: 0,
    cancelledTrips: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    // ✅ check logged in rider
    if (!user || user.role !== "rider") {
      setLoading(false);
      return;
    }

    // ✅ fetch rider trips
    axios
      .get(`${API_URL}/api/trips/rider/${user._id}`)
      .then((res) => {
        const trips = res.data || [];

        // ✅ completed trips only
        const completedTrips = trips.filter(
          (trip) => trip.status === "completed"
        );

        // ✅ pending trips
        const pendingTrips = trips.filter(
          (trip) => trip.status === "pending"
        );

        // ✅ cancelled trips
        const cancelledTrips = trips.filter(
          (trip) => trip.status === "cancelled"
        );

        // ✅ calculate totals
        const totalTrips = completedTrips.length;

        const totalKm = completedTrips.reduce(
          (sum, trip) => sum + (trip.distanceKm || 0),
          0
        );

        const totalPay = completedTrips.reduce(
          (sum, trip) => sum + (trip.fare || 0),
          0
        );

        setStats({
          totalTrips,
          totalKm,
          totalPay,
          pendingTrips: pendingTrips.length,
          cancelledTrips: cancelledTrips.length,
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error loading earnings:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="loading-text">Loading earnings...</p>;
  }

  return (
    <div className="earnings-container">
      <style>
        {`
          .earnings-container {
            padding: 30px;
            min-height: 100vh;
            background: #f5f7fb;
          }

          .earnings-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 30px;
            color: #111827;
          }

          .earnings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
          }

          .earnings-card {
            background: white;
            padding: 25px;
            border-radius: 18px;
            box-shadow: 0 4px 18px rgba(0,0,0,0.08);
            transition: 0.3s;
          }

          .earnings-card:hover {
            transform: translateY(-5px);
          }

          .earnings-card h2 {
            font-size: 30px;
            margin-bottom: 10px;
            color: #111827;
          }

          .earnings-card p {
            color: #666;
            font-size: 16px;
            margin: 0;
          }

          .green {
            border-left: 6px solid #198754;
          }

          .blue {
            border-left: 6px solid #0d6efd;
          }

          .orange {
            border-left: 6px solid #fd7e14;
          }

          .red {
            border-left: 6px solid #dc3545;
          }

          .loading-text {
            padding: 40px;
            text-align: center;
            font-size: 20px;
          }
        `}
      </style>

      <h2 className="earnings-title">💰 Rider Earnings Dashboard</h2>

      <div className="earnings-grid">

        {/* Completed Trips */}
        <div className="earnings-card green">
          <h2>{stats.totalTrips}</h2>
          <p>Completed Trips</p>
        </div>

        {/* Distance */}
        <div className="earnings-card blue">
          <h2>{stats.totalKm.toFixed(2)} km</h2>
          <p>Total Distance Covered</p>
        </div>

        {/* Earnings */}
        <div className="earnings-card green">
          <h2>KES {stats.totalPay.toFixed(2)}</h2>
          <p>Total Earnings</p>
        </div>

        {/* Pending */}
        <div className="earnings-card orange">
          <h2>{stats.pendingTrips}</h2>
          <p>Pending Deliveries</p>
        </div>

        {/* Cancelled */}
        <div className="earnings-card red">
          <h2>{stats.cancelledTrips}</h2>
          <p>Cancelled Deliveries</p>
        </div>

      </div>
    </div>
  );
}

export default RiderEarnings;
```
