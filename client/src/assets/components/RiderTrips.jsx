import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/trips.css";

function RiderTrips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "rider") {
      axios
        .get(`/api/rider/trips/${user._id}`) // ✅ backend route for trips
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
                <td>{new Date(trip.timestamp).toLocaleString()}</td>
                <td>
                  {trip.start_location?.lat.toFixed(3)},{" "}
                  {trip.start_location?.lng.toFixed(3)}
                </td>
                <td>
                  {trip.end_location?.lat.toFixed(3)},{" "}
                  {trip.end_location?.lng.toFixed(3)}
                </td>
                <td>{trip.distance_km.toFixed(2)}</td>
                <td>{trip.payment.toFixed(2)}</td>
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
