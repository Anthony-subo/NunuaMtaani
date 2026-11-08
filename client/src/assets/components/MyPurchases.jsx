import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/orders.css";

const API_URL = import.meta.env.VITE_API_URL;

function MyPurchases() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);

  // Rider modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [riders, setRiders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) {
      setLoading(false);
      setError("Please log in to view your purchases.");
      return;
    }

    fetchOrders(user._id);
    fetchRiders();
  }, []);

  // Fetch buyer's orders
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

  // Fetch all riders
  const fetchRiders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/riders`);
      setRiders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch riders:", err);
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

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

  // Open modal to assign rider
  const openRiderSelector = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Assign rider and create trip
  const assignRider = async () => {
    if (!selectedRider) return alert("Please select a rider.");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("User not found.");

    try {
      await axios.post(`${API_URL}/api/trips/start`, {
        orderId: selectedOrder._id,
        riderId: selectedRider,
        userId: user._id,
        shopId: selectedOrder.sellerShop || selectedOrder.shop_id,

        startLocation: { lat: 0, lng: 0 },
        endLocation: { lat: 0, lng: 0 },
        distanceKm: 1,
        fare: 100,
      });

      // Update order status locally
      setOrders((prev) =>
        prev.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, status: "deliver", assignedRider: selectedRider }
            : order
        )
      );

      setShowModal(false);
      setSelectedRider("");
      alert("Rider assigned and delivery started!");
    } catch (err) {
      console.error(err);
      alert("Failed to assign rider");
    }
  };

  // Badge mapping for status lookups
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": return "bg-warning text-dark";
      case "deliver": return "bg-info text-dark";
      case "completed": return "bg-success";
      case "cancelled": return "bg-danger";
      default: return "bg-secondary";
    }
  };

  if (loading) return <div className="text-center py-5">Loading your purchases...</div>;
  if (error) return <div className="container text-center py-5 text-danger">{error}</div>;

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>
      
      {/* Header section */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">🧾 My Purchases</h2>
          <p className="text-muted mb-0">Track your active orders and delivery statuses.</p>
        </div>
        <div className="bg-white p-3 rounded shadow-sm">
          <span className="text-muted small d-block">Total Orders</span>
          <strong className="fs-5">{orders.length}</strong>
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-4 rounded-4 shadow-sm border">
              
              {/* Order Meta Header */}
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3 flex-wrap gap-2">
                <div>
                  <span className="fw-bold text-primary">Order #{order._id.slice(-6).toUpperCase()}</span>
                  <span className="text-muted ms-3 small">
                    📅 {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <span className={`badge px-3 py-2 text-uppercase ${getStatusBadge(order.status)}`}>
                    {order.status || "unknown"}
                  </span>
                  {order.payment?.status && (
                    <span className={`badge px-3 py-2 ${order.payment.status === 'paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      Payment: {order.payment.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-3">
                <ul className="list-unstyled mb-0">
                  {(order.items || []).map((item, index) => (
                    <li key={index} className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                      <span>
                        🛒 <strong>{item.name}</strong> <span className="text-muted">× {item.quantity}</span>
                      </span>
                      <span className="fw-semibold">KES {item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Total & Action Buttons */}
              <div className="d-flex justify-content-between align-items-center pt-2 flex-wrap gap-3">
                <div className="fs-6">
                  Grand Total: <strong className="text-success fs-5">KES {order.total || 0}</strong>
                </div>

                <div className="d-flex gap-2">
                  {order.status === "pending" && (
                    <>
                      <button
                        className="btn btn-sm btn-outline-danger px-3"
                        disabled={cancelingId === order._id}
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        {cancelingId === order._id ? "Cancelling..." : "Cancel Order"}
                      </button>

                      <button
                        className="btn btn-sm btn-primary px-3"
                        onClick={() => openRiderSelector(order)}
                      >
                        🚚 Request Rider
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
          <p className="text-muted mb-0">You haven't made any purchases yet.</p>
        </div>
      )}

      {/* Rider Selection Modal Overlay */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1050
        }}>
          <div className="bg-white p-4 rounded-4 shadow-lg" style={{ width: "400px", maxWidth: "90%" }}>
            <h4 className="fw-bold mb-3">🚚 Select Delivery Rider</h4>
            <p className="text-muted small mb-3">Choose an available rider to deliver your items.</p>

            <select
              className="form-select form-select-lg mb-4"
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

            <div className="d-flex gap-2">
              <button className="btn btn-success flex-grow-1 py-2 fw-bold" onClick={assignRider}>
                Confirm & Assign
              </button>
              <button className="btn btn-light px-4 py-2" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyPurchases;