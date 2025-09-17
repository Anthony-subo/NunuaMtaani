import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// ✅ Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ✅ Helper to recenter map when position changes
function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

function RiderMap({ riderId }) {
  const [position, setPosition] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async ({ coords }) => {
          const newPos = [coords.latitude, coords.longitude];
          setPosition(newPos);
          setErrorMsg(null);

          // ✅ Send to backend
          try {
            await axios.put(`/api/riders/${riderId}/location`, {
              lat: parseFloat(coords.latitude),
              lng: parseFloat(coords.longitude),
            });
            console.log("Location saved:", newPos);
          } catch (err) {
            console.error("Error saving location:", err);
          }
        },
        (err) => {
          console.error("Error getting location:", err);
          if (err.code === 1) {
            setErrorMsg("⚠️ Location permission denied. Enable it in browser settings.");
          } else {
            setErrorMsg("⚠️ Unable to fetch location.");
          }
        },
        { enableHighAccuracy: true }
      );
    } else {
      setErrorMsg("Geolocation is not supported by your browser.");
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [riderId]);

  return (
    <div
      className="rounded-xl shadow-md"
      style={{ height: "500px", width: "100%", overflow: "hidden" }}
    >
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
          <Recenter position={position} />
        </MapContainer>
      ) : (
        <p className="text-center p-3">
          {errorMsg ? errorMsg : "📍 Loading your location..."}
        </p>
      )}
    </div>
  );
}

export default RiderMap;
