import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaMotorcycle,
  FaRoad,
  FaMoneyBillWave,
  FaMapMarkerAlt,
} from "react-icons/fa";
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

  // Summary Calculations
  const totalTrips = trips.length;

  const totalDistance = trips.reduce(
    (sum, trip) => sum + (trip.distanceKm || 0),
    0
  );

  const totalEarnings = trips.reduce(
    (sum, trip) => sum + (trip.fare || 0),
    0
  );

  return (
    <div className="trips-container">
      {/* Header */}
      <div className="trips-header">
        <h2>🚴 Rider Trips Dashboard</h2>
        <p>Track your completed trips, earnings, and distance covered.</p>
      </div>

      {/* Summary Cards */}
      <div className="trip-summary">
        <div className="summary-card">
          <div className="summary-icon trips-icon">
            <FaMotorcycle />
          </div>

          <div>
            <h4>{totalTrips}</h4>
            <p>Trips Completed</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon distance-icon">
            <FaRoad />
          </div>

          <div>
            <h4>{totalDistance.toFixed(2)} km</h4>
            <p>Total Distance</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon earnings-icon">
            <FaMoneyBillWave />
          </div>

          <div>
            <h4>KES {totalEarnings.toFixed(2)}</h4>
            <p>Total Earnings</p>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="table-wrapper">
        <h3 className="table-title">📋 Recent Trips</h3>

        {trips.length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Pickup</th>
                <th>Drop-off</th>
                <th>Distance</th>
                <th>Earnings</th>
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
                    <div className="location-cell">
                      <FaMapMarkerAlt className="location-icon" />

                      {trip.startLocation?.coordinates?.length === 2
                        ? `${trip.startLocation.coordinates[1].toFixed(
                            3
                          )}, ${trip.startLocation.coordinates[0].toFixed(3)}`
                        : "N/A"}
                    </div>
                  </td>

                  <td>
                    <div className="location-cell">
                      <FaMapMarkerAlt className="location-icon dropoff" />

                      {trip.endLocation?.coordinates?.length === 2
                        ? `${trip.endLocation.coordinates[1].toFixed(
                            3
                          )}, ${trip.endLocation.coordinates[0].toFixed(3)}`
                        : "N/A"}
                    </div>
                  </td>

                  <td className="distance-text">
                    {trip.distanceKm
                      ? `${trip.distanceKm.toFixed(2)} km`
                      : "0.00 km"}
                  </td>

                  <td className="earnings-text">
                    KES{" "}
                    {trip.fare
                      ? trip.fare.toFixed(2)
                      : "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <h4>No trips completed yet</h4>
            <p>Your completed rides will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RiderTrips;