import React, { useEffect, useState } from "react";
import axios from "axios";
import DeliveryMap from "../components/DeliveryMap"; // Import your interactive map component
import "../styles/orders.css";

const API_URL = import.meta.env.VITE_API_URL;

function MyPurchases() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);

  // Rider map modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) {
      setLoading(false);
      setError("Please log in to view your purchases.");
      return;
    }

    fetchOrders(user._id);
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

  // Open map modal to select rider
  const openRiderSelector = (order) => {
    setSelectedOrder(order);
    // Store current order and shop IDs in localStorage so DeliveryMap can pick them up
    localStorage.setItem("currentOrderId", order._id);
    localStorage.setItem("currentShopId", order.sellerShop || order.shop_id);
    setShowModal(true);
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
                        🗺️ Pick Rider from Map
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

      {/* Interactive Map Rider Selection Modal */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1050, padding: "20px"
        }}>
          <div className="bg-white p-4 rounded-4 shadow-lg" style={{ width: "650px", maxWidth: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">📍 Select Nearby Rider for Order #{selectedOrder?._id.slice(-6).toUpperCase()}</h4>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <p className="text-muted small mb-3">Click on any rider marker on the map to view their details and request delivery.</p>

            {/* Embedded Interactive Delivery Map */}
            <div className="mb-4">
              <DeliveryMap />
            </div>

            <div className="text-end">
              <button className="btn btn-secondary px-4 py-2" onClick={() => setShowModal(false)}>
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyPurchases;