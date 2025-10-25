import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ✅ Fix Leaflet marker icons
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
  const [position, setPosition] = useState([-1.2921, 36.8219]); // Default Nairobi center
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!riderId) return; // Wait until riderId is available
    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async ({ coords }) => {
          const { latitude, longitude } = coords;
          const newPos = [latitude, longitude];
          setPosition(newPos);
          setLoaded(true);

          try {
            // ✅ Send live GPS data to backend
            const res = await axios.put(`${API_URL}/api/riders/${riderId}/location`, {
              location: {
                latitude,
                longitude,
              },
              isAvailable: true,
            });

            console.log("✅ Location updated:", res.data);
          } catch (err) {
            console.error(
              "❌ Error saving location:",
              err.response?.data || err.message
            );
          }
        },
        (err) => {
          console.error("❌ Error getting location:", err);
          if (err.code === 1) {
            console.warn("⚠️ User denied location access. Using Nairobi fallback.");
          }
          setLoaded(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    } else {
      console.warn("⚠️ Geolocation not supported in this browser");
    }

    // Cleanup watcher when component unmounts
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [riderId]);

  return (
    <div
      className="rounded-xl shadow-md"
      style={{ height: "500px", width: "100%", overflow: "hidden" }}
    >
      {loaded ? (
        <MapContainer
          key={position.join(",")}
          center={position}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <b>You are here</b> 🚴 <br /> Current live location for deliveries.
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p className="text-center p-3">📍 Waiting for your GPS location...</p>
      )}
    </div>
  );
}

export default RiderMap;
