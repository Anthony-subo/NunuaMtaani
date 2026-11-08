import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/orders.css';

const API_URL = import.meta.env.VITE_API_URL;

function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [filterTab, setFilterTab] = useState('all');

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders`);
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
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, {
        status: newStatus
      });

      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      alert('Order status updated successfully');
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Error updating order status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning text-dark';
      case 'deliver': return 'bg-info text-dark';
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterTab === 'all') return true;
    return order.status === filterTab;
  });

  if (loading) {
    return <div className="text-center py-5">Loading platform orders...</div>;
  }

  return (
    <div className="container py-4" style={{ maxWidth: '1000px' }}>
      
      {/* Header & Metrics */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">📦 Platform Orders Overview</h2>
          <p className="text-muted mb-0">Supervise and manage all transactions across NunuaMtaani.</p>
        </div>
        <div className="bg-white p-3 rounded shadow-sm d-flex gap-4">
          <div>
            <span className="text-muted small d-block">Total Orders</span>
            <strong className="fs-5">{orders.length}</strong>
          </div>
          <div>
            <span className="text-muted small d-block">Total Value</span>
            <strong className="fs-5 text-success">
              KES {orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 d-flex gap-2 border-bottom pb-2 flex-wrap">
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

      {filteredOrders.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
          <p className="text-muted mb-0">No orders found.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredOrders.map((order) => {
            // Extract populated user info (supports name string or populated object)
            const userName = typeof order.user_id === 'object' && order.user_id !== null 
              ? (order.user_id.name || order.user_id.username || 'Unknown User') 
              : 'Customer';
            const userIdVal = typeof order.user_id === 'object' && order.user_id !== null 
              ? order.user_id._id 
              : (order.user_id || 'N/A');

            // Extract populated shop info
            const shopObj = order.sellerShop || order.shop_id;
            const shopName = typeof shopObj === 'object' && shopObj !== null 
              ? (shopObj.shop_name || 'Unknown Shop') 
              : 'Shop';
            const shopIdVal = typeof shopObj === 'object' && shopObj !== null 
              ? shopObj._id 
              : (shopObj || 'N/A');

            return (
              <div key={order._id} className="bg-white p-4 rounded-4 shadow-sm border">
                
                {/* Card Header */}
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3 flex-wrap gap-2">
                  <div>
                    <span className="fw-bold text-primary fs-5">#{order._id.slice(-6).toUpperCase()}</span>
                    <span className="text-muted ms-3 small">📅 {new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <span className={`badge px-3 py-2 text-uppercase ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                    {order.payment?.status && (
                      <span className={`badge px-3 py-2 ${order.payment.status === 'paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        Payment: {order.payment.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Detailed User & Shop Card Info */}
                <div className="row mb-3 g-2">
                  <div className="col-md-6">
                    <div className="p-2 bg-light rounded border-start border-primary border-4">
                      <span className="text-muted small d-block">Buyer Details</span>
                      <strong>👤 {userName}</strong>
                      <span className="text-muted small d-block text-truncate" style={{ fontSize: '11px' }}>ID: {userIdVal}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-2 bg-light rounded border-start border-success border-4">
                      <span className="text-muted small d-block">Vendor Shop Details</span>
                      <strong>🏪 {shopName}</strong>
                      <span className="text-muted small d-block text-truncate" style={{ fontSize: '11px' }}>ID: {shopIdVal}</span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
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

                {/* Footer Total & Actions */}
                <div className="d-flex justify-content-between align-items-center pt-2 flex-wrap gap-3">
                  <div className="fs-6">
                    Grand Total: <strong className="text-success fs-5">KES {order.total || 0}</strong>
                  </div>

                  <div className="d-flex align-items-center gap-2">
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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AllOrders;