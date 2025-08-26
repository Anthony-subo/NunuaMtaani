import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/orders.css';

function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch all orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  const handleSelectChange = (orderId, newStatus) => {
    setStatusUpdates(prev => ({
      ...prev,
      [orderId]: newStatus
    }));
  };

  const updateStatus = async (orderId) => {
    const newStatus = statusUpdates[orderId];
    if (!newStatus) return;

    try {
      await axios.put(`http://localhost:3001/api/orders/${orderId}/status`, {
        status: newStatus
      });

      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      alert('Order status updated');
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Error updating order status');
    }
  };

  if (loading) {
    return <div className="orders-container">Loading orders...</div>;
  }

  return (
    <div className="orders-container">
      <h3 className="orders-title">📦 All Platform Orders</h3>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="list-unstyled">
          {orders.map((order) => (
            <li key={order._id} className="order-card">
              <div className="order-header">
                <strong>Order #{order._id.slice(-6)}</strong>
              </div>

              <div className="order-meta">
                <span>📅 Placed: {new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="order-meta text-info">
                👤 User: {order.userId || 'N/A'} | 🏪 Shop: {order.shopId || 'N/A'}
              </div>

              <ul className="order-items">
                {(order.items || []).map((item, index) => (
                  <li key={index} className="order-item">
                    {item.name} × {item.quantity} — <strong>KES {item.price * item.quantity}</strong>
                  </li>
                ))}
              </ul>

              <div className="order-total">
                Total: <strong>KES {order.total || 0}</strong>
              </div>

              <div className="order-actions">
                <select
                  value={statusUpdates[order._id] || order.status}
                  onChange={(e) => handleSelectChange(order._id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="deliver">Deliver</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  className="update-btn"
                  disabled={
                    !statusUpdates[order._id] ||
                    statusUpdates[order._id] === order.status
                  }
                  onClick={() => updateStatus(order._id)}
                >
                  Update
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AllOrders;
