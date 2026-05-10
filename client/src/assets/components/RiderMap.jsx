import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

const API_URL = import.meta.env.VITE_API_URL;

/* =========================
   Custom Icons
========================= */

const buyerIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/3177/3177361.png",

  iconSize: [40, 40],
});

const riderIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/684/684908.png",

  iconSize: [35, 35],
});

/* =========================
   Component
========================= */

function DeliveryMap() {
  const [buyerLocation, setBuyerLocation] = useState(null);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     Get Buyer Location
  ========================= */

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.location?.lat && user?.location?.lng) {
      setBuyerLocation([user.location.lat, user.location.lng]);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setBuyerLocation([
            pos.coords.latitude,
            pos.coords.longitude,
          ]);
        },

        (err) => {
          console.error("GPS Error:", err);

          // Nairobi fallback
          setBuyerLocation([-1.2921, 36.8219]);
        },

        {
          enableHighAccuracy: true,
        }
      );
    }
  }, []);

  /* =========================
     Fetch Nearby Riders
  ========================= */

  const fetchRiders = async (lat, lng) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/riders/nearby?lat=${lat}&lng=${lng}`
      );

      setRiders(res.data || []);
    } catch (err) {
      console.error("Error fetching riders:", err);
    }
  };

  /* =========================
     Auto Refresh Riders
  ========================= */

  useEffect(() => {
    if (!buyerLocation) return;

    fetchRiders(buyerLocation[0], buyerLocation[1]);

    const interval = setInterval(() => {
      fetchRiders(buyerLocation[0], buyerLocation[1]);
    }, 5000); // refresh every 5 sec

    return () => clearInterval(interval);
  }, [buyerLocation]);

  /* =========================
     Assign Rider
  ========================= */

  const assignRider = async (riderId) => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));

      const orderId =
        localStorage.getItem("currentOrderId");

      const shopId =
        localStorage.getItem("currentShopId");

      if (!orderId || !shopId) {
        alert("No active order found.");
        return;
      }

      const startLocation = {
        type: "Point",
        coordinates: [
          buyerLocation[1],
          buyerLocation[0],
        ],
      };

      const endLocation = {
        type: "Point",
        coordinates: [37.0, -1.0],
      };

      await axios.post(
        `${API_URL}/api/trips/start`,
        {
          orderId,
          riderId,
          userId: user._id,
          shopId,
          startLocation,
          endLocation,
          distanceKm: 5,
          fare: 200,
        }
      );

      alert("✅ Rider assigned successfully");
    } catch (err) {
      console.error(err);

      alert("❌ Failed to assign rider");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Loading
  ========================= */

  if (!buyerLocation) {
    return (
      <div className="map-loading">
        📍 Getting your location...
      </div>
    );
  }

  return (
    <div className="delivery-map-container">
      <MapContainer
        center={buyerLocation}
        zoom={14}
        scrollWheelZoom={true}
        className="delivery-map"
      >
        {/* Map */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Buyer */}
        <Marker
          position={buyerLocation}
          icon={buyerIcon}
        >
          <Popup>
            <b>🛍️ Your Location</b>
          </Popup>
        </Marker>

        {/* Buyer Radius */}
        <Circle
          center={buyerLocation}
          radius={500}
        />

        {/* Riders */}
        {Array.isArray(riders) &&
          riders.map((rider) => (
            <Marker
              key={rider._id}
              icon={riderIcon}
              position={[
                rider.location.coordinates[1],
                rider.location.coordinates[0],
              ]}
            >
              <Popup>
                <div className="popup-card">
                  <h4>🚴 {rider.rider_name}</h4>

                  <p>
                    Vehicle:
                    {" "}
                    {rider.vehicle_type}
                  </p>

                  <p>
                    Phone:
                    {" "}
                    {rider.phone}
                  </p>

                  <button
                    className="request-btn"
                    disabled={loading}
                    onClick={() =>
                      assignRider(rider._id)
                    }
                  >
                    {loading
                      ? "Assigning..."
                      : "Request Delivery"}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

export default DeliveryMap;