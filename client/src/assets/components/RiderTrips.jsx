import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/trips.css";

const API_URL = import.meta.env.VITE_API_URL;

function RiderTrips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "rider") {
      axios
        .get(`${API_URL}/api/trips/rider/${user._id}`)
        .then((res) => {
          setTrips(res.data);
        })
        .catch((err) => {
          console.error("Error fetching trips:", err);
        });
    }
  }, []);

  return (
    <div className="trips-container">
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
                <td>{new Date(trip.createdAt).toLocaleString()}</td>
                <td>
                  {trip.startLocation?.coordinates[1].toFixed(3)},{" "}
                  {trip.startLocation?.coordinates[0].toFixed(3)}
                </td>
                <td>
                  {trip.endLocation?.coordinates[1].toFixed(3)},{" "}
                  {trip.endLocation?.coordinates[0].toFixed(3)}
                </td>
                <td>{trip.distanceKm.toFixed(2)}</td>
                <td>{trip.fare.toFixed(2)}</td>
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
