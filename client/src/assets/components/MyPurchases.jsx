import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/orders.css";

const API_URL = import.meta.env.VITE_API_URL;

function MyPurchases() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [riders, setRiders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) {
      setLoading(false);
      return;
    }

    fetchOrders(user._id);
    fetchRiders();
  }, []);

  const fetchOrders = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/api/orders/user/${userId}`);
      const data = res.data;
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      setError("Unable to load your purchases.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/riders`);
      setRiders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch riders:", err);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;

    setCancelingId(orderId);
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, {
        status: "cancelled",
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
    } catch (err) {
      alert("Failed to cancel order");
    } finally {
      setCancelingId(null);
    }
  };

  const openRiderSelector = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const assignRider = async () => {
    if (!selectedRider) return alert("Please select a rider.");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("User not found.");

    try {
      await axios.post(`${API_URL}/api/trips/start`, {
        orderId: selectedOrder._id,
        riderId: selectedRider,
        userId: user._id,
        shopId: selectedOrder.shop_id,

        // Dummy values for now
        startLocation: { lat: 0, lng: 0 },
        endLocation: { lat: 0, lng: 0 },
        distanceKm: 1,
        fare: 100,
      });

      // Update order status
      setOrders((prev) =>
        prev.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, status: "assigned", assignedRider: selectedRider }
            : order
        )
      );

      setShowModal(false);
      alert("Rider assigned and trip created!");
    } catch (err) {
      console.error(err);
      alert("Failed to assign rider");
    }
  };

  if (loading) return <div className="orders-container">Loading...</div>;
  if (error) return <div className="orders-container text-danger">{error}</div>;

  return (
    <div className="orders-container">
      <h3 className="orders-title">🧾 My Purchases</h3>

      {orders.length > 0 ? (
        <ul className="list-unstyled">
          {orders.map((order) => (
            <li key={order._id} className="order-card">
              <div className="order-header">
                Order #{order._id.slice(-6)}
              </div>

              <div className="order-meta">
                📅 Placed on:{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </div>

              <ul className="order-items">
                {(order.items || []).map((item, index) => (
                  <li key={index} className="order-item">
                    {item.name} × {item.quantity} —{" "}
                    <strong>KES {item.price * item.quantity}</strong>
                  </li>
                ))}
              </ul>

              <div className="order-total">
                Total: <strong>KES {order.total || 0}</strong>
              </div>

              <div className="order-status mb-2">
                Status:{" "}
                <span
                  className={`badge ${
                    order.status === "pending"
                      ? "bg-warning text-dark"
                      : order.status === "assigned"
                      ? "bg-info text-dark"
                      : order.status === "cancelled"
                      ? "bg-danger"
                      : order.status === "completed"
                      ? "bg-success"
                      : "bg-secondary"
                  }`}
                >
                  {order.status || "unknown"}
                </span>
              </div>

              {order.status === "pending" && (
                <>
                  <button
                    className="btn btn-sm btn-outline-danger me-2"
                    disabled={cancelingId === order._id}
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    {cancelingId === order._id ? "Cancelling..." : "Cancel Order"}
                  </button>

                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => openRiderSelector(order)}
                  >
                    Add Rider
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No purchases yet.</p>
      )}

      {/* Rider Selection Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h4>Select Rider</h4>

            <select
              className="form-select mb-3"
              value={selectedRider}
              onChange={(e) => setSelectedRider(e.target.value)}
            >
              <option value="">-- Choose Rider --</option>
              {riders.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.phone})
                </option>
              ))}
            </select>

            <button className="btn btn-success me-2" onClick={assignRider}>
              Assign Rider
            </button>

            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPurchases;
