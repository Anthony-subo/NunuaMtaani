import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/orders.css";

const API_URL = import.meta.env.VITE_API_URL;

function MyPurchases() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [cancelingId, setCancelingId] = useState(null);

  // Rider assignment modal states
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [riders, setRiders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchPurchases = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/my-orders/${user._id}`);
        setOrders(res.data.orders || []);
      } catch (error) {
        console.error("Error fetching purchases:", error);
      }
    };

    fetchPurchases();
  }, [user]);

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    setCancelingId(orderId);
    try {
      await axios.put(`${API_URL}/api/orders/cancel/${orderId}`);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
    setCancelingId(null);
  };

  // Open modal to select rider
  const openRiderSelector = async (order) => {
    setSelectedOrder(order);
    setShowRiderModal(true);

    try {
      const res = await axios.get(`${API_URL}/api/users/riders`);
      setRiders(res.data.riders || []);
    } catch (err) {
      console.error("Error loading riders:", err);
    }
  };

  // Assign rider to order
  const assignRider = async (riderId) => {
    try {
      await axios.put(`${API_URL}/api/orders/assign-rider`, {
        orderId: selectedOrder._id,
        riderId,
      });

      // Update UI instantly
      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id
            ? { ...o, status: "assigned", rider: riderId }
            : o
        )
      );

      setShowRiderModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error assigning rider:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">My Purchases</h2>

      {orders.length === 0 ? (
        <p>No purchases found.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card shadow-sm p-3 mb-3 rounded">
              <h5 className="fw-bold">Order #{order._id}</h5>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total Price:</strong> KES {order.totalPrice}</p>
              <p><strong>Payment:</strong> {order.paymentMethod}</p>

              {order.rider && (
                <p className="text-success">
                  <strong>Assigned Rider:</strong> {order.rider}
                </p>
              )}

              {/* ACTION BUTTONS */}
              {order.status === "pending" && (
                <>
                  <button
                    className="btn btn-sm btn-outline-danger me-2"
                    disabled={cancelingId === order._id}
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    {cancelingId === order._id ? "Cancelling..." : "Cancel Order"}
                  </button>

                  {/* NEW: Add Rider Button */}
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => openRiderSelector(order)}
                  >
                    Add Rider
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* RIDER SELECTION MODAL */}
      {showRiderModal && (
        <div className="modal-overlay">
          <div className="modal-content p-4 rounded">
            <h4>Select Rider</h4>
            <p>Choose a rider to deliver this order.</p>

            {riders.length === 0 ? (
              <p>No riders available.</p>
            ) : (
              riders.map((rider) => (
                <div
                  key={rider._id}
                  className="rider-card p-2 mb-2 border rounded d-flex justify-content-between"
                >
                  <span>{rider.name}</span>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => assignRider(rider._id)}
                  >
                    Assign
                  </button>
                </div>
              ))
            )}

            <button className="btn btn-secondary mt-3" onClick={() => setShowRiderModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPurchases;
