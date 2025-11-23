import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/trips.css";

const API_URL = import.meta.env.VITE_API_URL;

function RiderTrips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "rider") return;

    axios
      .get(`${API_URL}/api/trips/rider/${user._id}`)
      .then((res) => setTrips(res.data || []))
      .catch((err) => {
        console.error("Error fetching trips:", err);
      });
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
                <td>
                  {trip.createdAt
                    ? new Date(trip.createdAt).toLocaleString()
                    : "N/A"}
                </td>

                <td>
                  {trip.startLocation &&
                  trip.startLocation.coordinates &&
                  trip.startLocation.coordinates.length === 2
                    ? `${trip.startLocation.coordinates[1].toFixed(3)}, ${trip.startLocation.coordinates[0].toFixed(3)}`
                    : "N/A"}
                </td>

                <td>
                  {trip.endLocation &&
                  trip.endLocation.coordinates &&
                  trip.endLocation.coordinates.length === 2
                    ? `${trip.endLocation.coordinates[1].toFixed(3)}, ${trip.endLocation.coordinates[0].toFixed(3)}`
                    : "N/A"}
                </td>

                <td>{trip.distanceKm ? trip.distanceKm.toFixed(2) : "0.00"}</td>

                <td>{trip.fare ? trip.fare.toFixed(2) : "0.00"}</td>
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
