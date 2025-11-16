import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const API_URL = import.meta.env.VITE_API_URL;

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function RiderMap({ riderId }) {
  const [position, setPosition] = useState([-1.2921, 36.8219]); // default Nairobi
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!riderId || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        setPosition([latitude, longitude]);
        setLoaded(true);

        try {
          await axios.put(`${API_URL}/api/riders/${riderId}/location`, {
            latitude,
            longitude,
            isAvailable: true,
          });
          console.log("✅ Location updated:", latitude, longitude);
        } catch (err) {
          console.error("❌ Error updating location:", err.response?.data || err.message);
        }
      },
      (err) => {
        console.error("❌ Error getting location:", err);
        setLoaded(false);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [riderId]);

  return (
    <div style={{ height: "500px", width: "100%" }}>
      {loaded ? (
        <MapContainer key={position.join(",")} center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>📍 You are here (Rider)</Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p>📍 Waiting for GPS location...</p>
      )}
    </div>
  );
}

export default RiderMap;
