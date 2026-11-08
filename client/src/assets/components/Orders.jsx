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
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'pending', 'deliver', 'completed', 'cancelled'

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

      alert('Order status updated successfully!');
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Error updating order status');
    }
  };

  // Helper for badge colors based on order status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'deliver': return 'badge-info';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  // Filter orders according to active tab
  const filteredOrders = orders.filter(order => {
    if (filterTab === 'all') return true;
    return order.status === filterTab;
  });

  if (loading) return <div className="orders-container text-center py-5">Loading orders...</div>;

  return (
    <div className="orders-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
      
      {/* Header & Metrics Summary */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h2 className="orders-title mb-1" style={{ fontWeight: 'bold' }}>🛍️ {shopName} - Orders</h2>
          <p className="text-muted">Manage and fulfill customer requests efficiently.</p>
        </div>
        <div className="order-stats bg-white p-3 rounded shadow-sm d-flex gap-4">
          <div>
            <span className="d-block text-muted small">Total Orders</span>
            <strong className="fs-5">{orders.length}</strong>
          </div>
          <div>
            <span className="d-block text-muted small">Pending Fulfillment</span>
            <strong className="fs-5 text-warning">
              {orders.filter(o => o.status === 'pending').length}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="order-tabs mb-4 d-flex gap-2 border-bottom pb-2">
        {['all', 'pending', 'deliver', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`btn btn-sm text-capitalize ${filterTab === tab ? 'btn-dark' : 'btn-outline-secondary'}`}
            style={{ borderRadius: '20px', padding: '6px 16px' }}
          >
            {tab} ({orders.filter(o => tab === 'all' ? true : o.status === tab).length})
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm">
          <p className="text-muted mb-0">No orders found in this category.</p>
        </div>
      ) : (
        <div className="orders-list d-flex flex-column gap-3">
          {filteredOrders.map((order) => (
            <div key={order._id} className="order-card bg-white p-4 rounded shadow-sm border">
              
              {/* Card Top Meta */}
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                <div>
                  <span className="fw-bold text-primary">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className="text-muted ms-3 small">🕒 {new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className={`badge px-3 py-2 text-uppercase ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  {order.payment?.status && (
                    <span className={`badge ms-2 px-2 py-2 ${order.payment.status === 'paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      Payment: {order.payment.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Items Table / List */}
              <div className="order-items-section mb-3">
                <ul className="list-unstyled mb-0">
                  {order.items.map((item, index) => (
                    <li key={index} className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                      <span>
                        🛒 <strong>{item.name}</strong> <span className="text-muted">× {item.quantity}</span>
                      </span>
                      <span className="text-dark fw-semibold">KES {item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer: Total & Status Changer */}
              <div className="d-flex justify-content-between align-items-center pt-2 flex-wrap gap-3">
                <div className="order-total fs-6">
                  Grand Total: <strong className="text-success fs-5">KES {order.total}</strong>
                </div>

                <div className="order-actions d-flex align-items-center gap-2">
                  <select
                    value={statusUpdates[order._id] || order.status}
                    onChange={(e) => handleSelectChange(order._id, e.target.value)}
                    className="form-select form-select-sm"
                    style={{ width: '140px' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="deliver">Deliver</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    className="btn btn-sm btn-primary px-3"
                    disabled={
                      !statusUpdates[order._id] ||
                      statusUpdates[order._id] === order.status
                    }
                    onClick={() => updateStatus(order._id)}
                  >
                    Update
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;