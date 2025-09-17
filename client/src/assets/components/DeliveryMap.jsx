// src/components/DeliveryMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function DeliveryMap() {
  const [position, setPosition] = useState(null); // buyer position
  const [riders, setRiders] = useState([]);

  // Get buyer location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);

        try {
          // fetch nearby riders from backend
          const res = await axios.get(
            `/api/riders/nearby?lng=${longitude}&lat=${latitude}`
          );
          setRiders(res.data);
        } catch (err) {
          console.error("Error fetching riders", err);
        }
      },
      (err) => console.error("Geolocation error", err),
      { enableHighAccuracy: true }
    );
  }, []);

  if (!position) return <p>📍 Locating you...</p>;

  return (
    <MapContainer center={position} zoom={13} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Buyer Marker */}
      <Marker position={position}>
        <Popup>🛒 You are here</Popup>
      </Marker>

      {/* Rider Markers */}
      {riders.map((rider) => (
        <Marker
          key={rider._id}
          position={[
            rider.location.coordinates[1], // lat
            rider.location.coordinates[0], // lng
          ]}
        >
          <Popup>
            🚴 Rider {rider.rider_id} <br />
            {rider.user_id?.name}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
