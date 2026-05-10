import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const API_URL = import.meta.env.VITE_API_URL;

/* =========================
   Custom Rider Icon
========================= */

const riderIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/684/684908.png",

  iconSize: [45, 45],
});

/* =========================
   Recenter Map
========================= */

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 15, {
      duration: 1.5,
    });
  }, [position, map]);

  return null;
}

/* =========================
   Rider Map
========================= */

function RiderMap({ riderId }) {
  const [position, setPosition] = useState([
    -1.2921,
    36.8219,
  ]);

  const [loaded, setLoaded] = useState(false);

  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    const watchId =
      navigator.geolocation.watchPosition(
        async ({ coords }) => {
          const {
            latitude,
            longitude,
            speed,
          } = coords;

          const newPosition = [
            latitude,
            longitude,
          ];

          setPosition(newPosition);

          setLoaded(true);

          // Speed km/h
          if (speed) {
            setSpeed((speed * 3.6).toFixed(1));
          }

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

              console.log(
                "✅ Rider location updated"
              );
            }
          } catch (err) {
            console.error(
              "❌ Update Error:",
              err.response?.data ||
                err.message
            );
          }
        },

        (err) => {
          console.error(
            "❌ GPS Error:",
            err
          );
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

    return () =>
      navigator.geolocation.clearWatch(
        watchId
      );
  }, [riderId]);

  return (
    <div className="rider-map-wrapper">
      {/* Status Bar */}
      <div className="rider-status-card">
        <div>
          <h3>🚴 Rider Live Tracking</h3>

          <p>
            GPS Status:
            <span className="online">
              {" "}
              Online
            </span>
          </p>
        </div>

        <div className="speed-box">
          <h2>{speed || 0}</h2>
          <span>km/h</span>
        </div>
      </div>

      {/* Loading */}
      {!loaded && (
        <div className="map-loading">
          📍 Getting your live location...
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        className="rider-map"
      >
        <RecenterMap position={position} />

        {/* Map Style */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Rider Radius */}
        <Circle
          center={position}
          radius={120}
        />

        {/* Rider Marker */}
        <Marker
          position={position}
          icon={riderIcon}
        >
          <Popup>
            <div className="popup-card">
              <h4>
                🚴 Rider Current Location
              </h4>

              <p>
                Latitude:
                {" "}
                {position[0].toFixed(5)}
              </p>

              <p>
                Longitude:
                {" "}
                {position[1].toFixed(5)}
              </p>

              <p>
                Speed:
                {" "}
                {speed || 0}
                {" "}km/h
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default RiderMap;