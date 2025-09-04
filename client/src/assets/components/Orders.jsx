import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/orders.css'; // Ensure this file exists

const API_URL = import.meta.env.VITE_API_URL;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [shopId, setShopId] = useState('');
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    const fetchShopAndOrders = async () => {
  try {
        const res = await axios.get(`${API_URL}/api/shops/user/${user._id}`);
        const shop = res.data.shop;
        setShopId(shop._id);
        setShopName(shop.shop_name);

        const orderRes = await axios.get(`${API_URL}/api/orders/seller/${shop._id}`);
        setOrders(orderRes.data);
  } catch (err) {
        console.error('Failed to fetch shop or orders:', err);
      } finally {
        setLoading(false);
  }
    };

    fetchShopAndOrders();
  }, []);

  const handleSelectChange = (orderId, newStatus) => {
    setStatusUpdates(prev => ({
      ...prev,
      [orderId]: newStatus
    }));
  };

  const updateStatus = async (orderId) => {
    const newStatus = statusUpdates[orderId];
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus });

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

  if (loading) return <div className="orders-container">Loading orders...</div>;

  return (
    <div className="orders-container">
      <h3 className="orders-title">🛍️ Orders for <span>{shopName}</span></h3>

      {orders.length === 0 ? (
        <p>No orders found for your shop.</p>
      ) : (
        <ul className="list-unstyled">
          {orders.map((order) => (
            <li key={order._id} className="order-card">
              <div className="order-header">[Order #{order._id.slice(-6)}]</div>

              <div className="order-meta">
                Placed on: {new Date(order.createdAt).toLocaleString()}
              </div>

              <ul className="order-items">
                {order.items.map((item, index) => (
                  <li key={index} className="order-item">
                    {item.name} × {item.quantity} — <strong>KES {item.price * item.quantity}</strong>
                  </li>
                ))}
              </ul>

              <div className="order-total">
                Total: <strong>KES {order.total}</strong>
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

export default Orders;
