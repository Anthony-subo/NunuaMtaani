import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import axios from "axios";

// ✅ Import API URL from env
const API_URL = import.meta.env.VITE_API_URL;

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function RiderMap({ riderId }) {   // ✅ pass riderId from props or context
  const [position, setPosition] = useState(null);

  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async ({ coords }) => {
          const newPos = [coords.latitude, coords.longitude];
          setPosition(newPos);

          // ✅ Send to backend with API_URL
          try {
            await axios.patch(`${API_URL}/api/riders/${riderId}/location`, {
              lat: coords.latitude,
              lng: coords.longitude,
            });
            console.log("Location saved:", newPos);
          } catch (err) {
            console.error("Error saving location:", err);
          }
        },
        (err) => console.error("Error getting location:", err),
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [riderId]);

  return (
    <div className="rounded-xl shadow-md" style={{ height: "500px", width: "100%", overflow: "hidden" }}>
      {position ? (
        <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <b>You are here</b> 🚴 <br /> Current location for deliveries.
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p className="text-center p-3">📍 Loading your location...</p>
      )}
    </div>
  );
}

export default RiderMap;
