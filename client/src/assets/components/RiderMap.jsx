import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const API_URL = import.meta.env.VITE_API_URL;

// ✅ Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ✅ Auto recenter map
function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 15);
  }, [position, map]);

  return null;
}

function RiderMap({ riderId }) {
  const [position, setPosition] = useState([-1.2921, 36.8219]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;

        const newPosition = [latitude, longitude];

        setPosition(newPosition);
        setLoaded(true);

        try {
          if (riderId) {
            await axios.put(
              `${API_URL}/api/riders/${riderId}/location`,
              {
                latitude,
                longitude,
                isAvailable: true,
              }
            );

            console.log("✅ Location updated");
          }
        } catch (err) {
          console.error(
            "❌ Location update error:",
            err.response?.data || err.message
          );
        }
      },

      (err) => {
        console.error("❌ GPS Error:", err);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [riderId]);

  return (
    <div className="rider-map-container">
      {!loaded && (
        <div className="map-loading">
          📍 Waiting for GPS location...
        </div>
      )}

      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <RecenterMap position={position} />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>
          <Popup>🚴 Rider Current Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default RiderMap;