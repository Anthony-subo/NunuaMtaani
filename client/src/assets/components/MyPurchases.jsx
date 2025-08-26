import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/orders.css';

function MyPurchases() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) {
      setLoading(false);
      return;
    }

    setUserId(user._id);

    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/orders');
        const userOrders = res.data.filter(order => order.user_id === user._id);
        setOrders(userOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;

    try {
      await axios.put(`http://localhost:3001/api/orders/${orderId}/status`, {
        status: 'cancelled'
      });

      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );

      alert('Order cancelled successfully');
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert('Error cancelling order');
    }
  };

  if (loading) return <div className="orders-container">Loading your purchases...</div>;

  return (
    <div className="orders-container">
      <h3 className="orders-title">🧾 My Purchase</h3>

      {orders.length === 0 ? (
        <p className="text-muted">🕐 You have not placed any orders yet.</p>
      ) : (
        <ul className="list-unstyled">
          {orders.map((order) => (
            <li key={order._id} className="order-card">
              <div className="order-header">Order #{order._id.slice(-6)}</div>

              <div className="order-meta">
                📅 Placed on:{' '}
                {new Date(order.createdAt).toLocaleDateString('en-KE', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
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
                Total: <strong>KES {order.total}</strong>
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
                  {order.status}
                </span>
              </div>

              {order.status === 'pending' && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleCancelOrder(order._id)}
                >
                  Cancel Order
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyPurchases;
