import React, { useState, useEffect } from "react";
import axios from "axios";

function MyPurchases() {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchRiders();
  }, []);

  const fetchOrders = async () => {
    const res = await axios.get("/api/orders/my"); // adjust endpoint
    setOrders(res.data);
  };

  const fetchRiders = async () => {
    const res = await axios.get("/api/riders");
    setRiders(res.data);
  };

  const assignRider = async (order) => {
    if (!selectedRider) return alert("Select a rider first!");

    try {
      // 1. Assign rider to order (update order record)
      await axios.put(`/api/orders/${order._id}/assign`, { riderId: selectedRider });

      // 2. Create trip entry
      await axios.post("/api/riders/trips/start", {
        order_id: order._id,
        rider_id: selectedRider,
        user_id: order.user_id,
        shop_id: order.shop_id,
        startLocation: {
          type: "Point",
          coordinates: order.shopLocation.coordinates, // seller/shop location
        },
        endLocation: {
          type: "Point",
          coordinates: order.userLocation.coordinates, // buyer location
        },
        distanceKm: order.estimatedDistance,
        fare: order.deliveryFee,
      });

      alert("Rider assigned and trip created!");
      fetchOrders();
    } catch (err) {
      console.error("Error assigning rider:", err);
      alert("Failed to assign rider");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Purchases</h2>

      {orders.map((order) => (
        <div key={order._id} className="border p-3 rounded mb-3">
          <p><b>Order ID:</b> {order._id}</p>
          <p><b>Status:</b> {order.status}</p>

          <select
            value={selectedRider}
            onChange={(e) => setSelectedRider(e.target.value)}
            className="border p-2 rounded mr-2"
          >
            <option value="">Select Rider</option>
            {riders.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => assignRider(order)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Assign Rider
          </button>
        </div>
      ))}
    </div>
  );
}

export default MyPurchases;
