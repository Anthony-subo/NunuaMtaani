import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/orders.css';

const API_URL = import.meta.env.VITE_API_URL;

function MyPurchases() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) {
      setLoading(false);
      return;
    }

    setUserId(user._id);

    const fetchOrders = async () => {
      try {
        // 🚀 better: fetch only this user’s orders
        const res = await axios.get(`${API_URL}/api/orders/user/${user._id}`);
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Unable to load your purchases. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;

    setCancelingId(orderId);
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, {
        status: 'cancelled',
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );

      alert('Order cancelled successfully');
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert('Error cancelling order');
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return <div className="orders-container">⏳ Loading your purchases...</div>;
  }

  if (error) {
    return <div className="orders-container text-danger">{error}</div>;
  }

  return (
    <div className="orders-container">
      <h3 className="orders-title">🧾 My Purchases</h3>

      {orders.length === 0 ? (
        <p className="text-muted">🕐 You have not placed any orders yet.</p>
      ) : (
        <ul className="list-unstyled">
          {orders.map((order) => (
            <li key={order._id} className="order-card">
              <div className="order-header">
                Order #{order._id.slice(-6)}
              </div>

              <div className="order-meta">
                📅 Placed on:{' '}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-KE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </div>

              <ul className="order-items">
                {(order.items || []).map((item, index) => (
                  <li key={index} className="order-item">
                    {item.name} × {item.quantity} —{' '}
                    <strong>KES {item.price * item.quantity}</strong>
                  </li>
                ))}
              </ul>

              <div className="order-total">
                Total: <strong>KES {order.total || 0}</strong>
              </div>

              <div className="order-status mb-2">
                Status:{' '}
                <span
                  className={`badge ${
                    order.status === 'pending'
                      ? 'bg-warning text-dark'
                      : order.status === 'cancelled'
                      ? 'bg-danger'
                      : order.status === 'completed'
                      ? 'bg-success'
                      : 'bg-secondary'
                  }`}
                >
                  {order.status || 'unknown'}
                </span>
              </div>

              {order.status === 'pending' && (
                <>
                  <button
                    className="btn btn-sm btn-outline-danger me-2"
                    disabled={cancelingId === order._id}
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    {cancelingId === order._id
                      ? 'Cancelling...'
                      : 'Cancel Order'}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyPurchases;
