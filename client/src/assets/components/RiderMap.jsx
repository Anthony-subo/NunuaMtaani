import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

// Helper component to recenter map when position updates
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

function RiderMap({ riderId }) {
  const [position, setPosition] = useState([-1.2921, 36.8219]); // default Nairobi
  const [gpsStatus, setGpsStatus] = useState("📍 Acquiring GPS location...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("❌ Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        const newPos = [latitude, longitude];
        setPosition(newPos);
        setGpsStatus("✅ GPS Active");

        if (riderId) {
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
        }
      },
      (err) => {
        console.error("❌ Error getting location:", err);
        setGpsStatus(`⚠️ GPS Error: ${err.message}. Using default location.`);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [riderId]);

  return (
    <div style={{ height: "500px", width: "100%", position: "relative" }}>
      <div style={{ 
        position: "absolute", 
        top: "10px", 
        right: "10px", 
        zIndex: 1000, 
        background: "rgba(255, 255, 255, 0.9)", 
        padding: "6px 12px", 
        borderRadius: "8px", 
        fontSize: "0.85rem", 
        fontWeight: "600",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
      }}>
        {gpsStatus}
      </div>

      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>📍 You are here (Rider)</Popup>
        </Marker>
        <RecenterMap position={position} />
      </MapContainer>
    </div>
  );
}

export default RiderMap;