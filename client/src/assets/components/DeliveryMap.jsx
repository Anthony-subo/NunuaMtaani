import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

function DeliveryMap() {
  const [buyerLocation, setBuyerLocation] = useState(null); // [lat, lng]
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Get buyer location (saved OR fallback to browser geolocation)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.location?.lat && user?.location?.lng) {
      setBuyerLocation([user.location.lat, user.location.lng]);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setBuyerLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // ✅ Fetch riders near buyer
  const fetchRiders = async (lat, lng) => {
    try {
      const res = await axios.get(`/api/riders/nearby?lat=${lat}&lng=${lng}`);
      setRiders(res.data || []);
    } catch (err) {
      console.error("Error fetching riders:", err);
    }
  };

  // ✅ Auto-refresh riders every 10s
  useEffect(() => {
    if (!buyerLocation) return;

    fetchRiders(buyerLocation[0], buyerLocation[1]); // initial fetch
    const interval = setInterval(() => {
      fetchRiders(buyerLocation[0], buyerLocation[1]);
    }, 10000);

    return () => clearInterval(interval);
  }, [buyerLocation]);

  // ✅ Assign a rider + start trip
  const assignRider = async (riderId) => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const orderId = localStorage.getItem("currentOrderId");
      const shopId = localStorage.getItem("currentShopId"); // 👈 save this when order is created

      if (!orderId || !shopId) {
        alert("No active order found.");
        return;
      }

      // Buyer = startLocation
      const startLocation = {
        type: "Point",
        coordinates: [buyerLocation[1], buyerLocation[0]], // [lng, lat]
      };

      // For now: delivery destination = shop location (replace with real one later)
      const endLocation = {
        type: "Point",
        coordinates: [37.0, -1.0], // TODO: replace with buyer’s delivery destination
      };

      // Call backend trip creation
      const res = await axios.post("/api/trips/start", {
        orderId,
        riderId,
        userId: user._id,
        shopId,
        startLocation,
        endLocation,
        distanceKm: 5, // 👉 placeholder (backend can compute haversine)
        fare: 200,     // 👉 placeholder (backend can compute dynamic fare)
      });

      alert(`✅ Trip started with rider: ${res.data.trip.rider_id}`);
    } catch (err) {
      console.error("Error starting trip:", err);
      alert("❌ Failed to start trip");
    } finally {
      setLoading(false);
    }
  };

  if (!buyerLocation)
    return (
      <p className="text-center text-danger">
        📍 Unable to get your location. Please allow location access.
      </p>
    );

  return (
    <div
      className="rounded-xl shadow-md"
      style={{ height: "500px", width: "100%", overflow: "hidden" }}
    >
      <MapContainer
        center={buyerLocation}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Buyer Marker */}
        <Marker position={buyerLocation}>
          <Popup>
            <b>You are here 🛍️</b>
          </Popup>
        </Marker>

        {/* Rider Markers */}
        {Array.isArray(riders) &&
          riders.map((rider) => (
            <Marker
              key={rider._id}
              position={[
                rider.location.coordinates[1],
                rider.location.coordinates[0],
              ]}
            >
              <Popup>
                🚴 Rider: <b>{rider.rider_name}</b> <br />
                Vehicle: {rider.vehicle_type} <br />
                Phone: {rider.phone} <br />
                <button
                  className="btn btn-sm btn-success mt-2"
                  disabled={loading}
                  onClick={() => assignRider(rider._id)}
                >
                  {loading ? "Assigning..." : "Request Delivery"}
                </button>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

export default DeliveryMap;
