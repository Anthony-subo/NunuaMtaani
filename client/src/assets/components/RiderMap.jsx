import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Default icon fix for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function RiderMap() {
  const [position, setPosition] = useState([0, 0]); // default
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setLoaded(true);
        },
        (err) => {
          console.error("Error getting location:", err);
          setLoaded(false);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  return (
    <div style={{ height: "500px", width: "100%", borderRadius: "10px", overflow: "hidden" }}>
      {loaded ? (
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
