import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import axios from "axios";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function DeliveryMap({ buyer }) {
  const [riders, setRiders] = useState([]);
  const [buyerPos, setBuyerPos] = useState(null);

  // 🔄 Fetch riders every 10s
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        let url;
        if (buyer?.location?.coordinates?.length) {
          const [lng, lat] = buyer.location.coordinates;
          url = `/api/riders/nearby?lng=${lng}&lat=${lat}`;
        } else {
          // fallback → use live geolocation
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              ({ coords }) => setBuyerPos([coords.latitude, coords.longitude])
            );
          }
          url = `/api/riders`; // fallback fetch all riders
        }
        const res = await axios.get(url);
        setRiders(res.data);
      } catch (err) {
        console.error("Error fetching riders:", err);
      }
    };

    fetchRiders();
    const interval = setInterval(fetchRiders, 10000);
    return () => clearInterval(interval);
  }, [buyer]);

  const center = buyer?.location?.coordinates?.length
    ? [buyer.location.coordinates[1], buyer.location.coordinates[0]]
    : buyerPos || [ -1.2921, 36.8219 ]; // default Nairobi

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {buyerPos && (
          <Marker position={buyerPos}>
            <Popup>📍 You (Buyer)</Popup>
          </Marker>
        )}

        {riders.map(r => (
          <Marker key={r._id} position={[r.location.coordinates[1], r.location.coordinates[0]]}>
            <Popup>
              🚴 Rider: <b>{r.rider_name}</b><br />
              Vehicle: {r.vehicle_type}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default DeliveryMap;
