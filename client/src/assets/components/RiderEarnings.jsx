import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/trips.css";

const API_URL = import.meta.env.VITE_API_URL;

function RiderTrips() {
  const [trips, setTrips] = useState([]);

  // ✅ Earnings state
  const [earnings, setEarnings] = useState({
    totalTrips: 0,
    totalKm: 0,
    totalPay: 0,
    pendingPay: 0,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "rider") return;

    axios
      .get(`${API_URL}/api/trips/rider/${user._id}`)
      .then((res) => {
        const tripData = res.data || [];
        setTrips(tripData);

        // ✅ Calculate stats
        const totalTrips = tripData.length;

        const totalKm = tripData.reduce(
          (sum, trip) => sum + (trip.distanceKm || 0),
          0
        );

        const totalPay = tripData.reduce(
          (sum, trip) => sum + (trip.fare || 0),
          0
        );

        // ✅ Example pending payout
        // change logic if you have payment status
        const pendingPay = tripData
          .filter((trip) => trip.paymentStatus !== "paid")
          .reduce((sum, trip) => sum + (trip.fare || 0), 0);

        setEarnings({
          totalTrips,
          totalKm,
          totalPay,
          pendingPay,
        });
      })
      .catch((err) => {
        console.error("Error fetching trips:", err);
      });
  }, []);

  return (
    <div className="trips-container">
      {/* ✅ Earnings Section */}
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

      {/* ✅ Trips Table */}
      <h3 className="mb-3">📋 My Trips</h3>

      {trips.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Pickup</th>
              <th>Drop-off</th>
              <th>Distance (km)</th>
              <th>Earnings (KES)</th>
            </tr>
          </thead>

          <tbody>
            {trips.map((trip, i) => (
              <tr key={i}>
                <td>
                  {trip.createdAt
                    ? new Date(trip.createdAt).toLocaleString()
                    : "N/A"}
                </td>

                <td>
                  {trip.startLocation &&
                  trip.startLocation.coordinates &&
                  trip.startLocation.coordinates.length === 2
                    ? `${trip.startLocation.coordinates[1].toFixed(
                        3
                      )}, ${trip.startLocation.coordinates[0].toFixed(3)}`
                    : "N/A"}
                </td>

                <td>
                  {trip.endLocation &&
                  trip.endLocation.coordinates &&
                  trip.endLocation.coordinates.length === 2
                    ? `${trip.endLocation.coordinates[1].toFixed(
                        3
                      )}, ${trip.endLocation.coordinates[0].toFixed(3)}`
                    : "N/A"}
                </td>

                <td>
                  {trip.distanceKm
                    ? trip.distanceKm.toFixed(2)
                    : "0.00"}
                </td>

                <td>
                  {trip.fare
                    ? trip.fare.toFixed(2)
                    : "0.00"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted">No trips completed yet.</p>
      )}
    </div>
  );
}

export default RiderTrips;