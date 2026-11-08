import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import '../styles/orders.css';

const API_URL = import.meta.env.VITE_API_URL;

function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [updatingMap, setUpdatingMap] = useState({});
  const [filterTab, setFilterTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders`);
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to fetch all orders:', err);
        showNotification('Failed to fetch orders from server.', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  const showNotification = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectChange = (orderId, newStatus) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  const updateStatus = async (orderId) => {
    const newStatus = statusUpdates[orderId];
    if (!newStatus) return;

    setUpdatingMap((prev) => ({ ...prev, [orderId]: true }));

    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, {
        status: newStatus,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Clean up update state for this order
      setStatusUpdates((prev) => {
        const copy = { ...prev };
        delete copy[orderId];
        return copy;
      });

      showNotification('Order status updated successfully');
    } catch (err) {
      console.error('Failed to update order status:', err);
      showNotification('Error updating order status', 'danger');
    } finally {
      setUpdatingMap((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'deliver':
        return 'bg-info-subtle text-info-emphasis border border-info-subtle';
      case 'completed':
        return 'bg-success-subtle text-success-emphasis border border-success-subtle';
      case 'cancelled':
        return 'bg-danger-subtle text-danger-emphasis border border-danger-subtle';
      default:
        return 'bg-secondary-subtle text-secondary-emphasis';
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab = filterTab === 'all' || order.status === filterTab;
      
      const userName = typeof order.user_id === 'object' && order.user_id !== null 
        ? (order.user_id.name || order.user_id.username || '') 
        : '';
      const shopObj = order.sellerShop || order.shop_id;
      const shopName = typeof shopObj === 'object' && shopObj !== null 
        ? (shopObj.shop_name || '') 
        : '';
      const orderId = order._id || '';

      const term = searchTerm.toLowerCase();
      const matchesSearch =
        orderId.toLowerCase().includes(term) ||
        userName.toLowerCase().includes(term) ||
        shopName.toLowerCase().includes(term);

      return matchesTab && matchesSearch;
    });
  }, [orders, filterTab, searchTerm]);

  const totalValue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <span className="text-muted fw-medium">Loading platform orders...</span>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: '1050px' }}>
      
      {/* Alert Notification */}
      {toastMessage && (
        <div className={`alert alert-${toastMessage.type} alert-dismissible fade show mb-4`} role="alert">
          {toastMessage.msg}
          <button type="button" className="btn-close" onClick={() => setToastMessage(null)}></button>
        </div>
      )}

      {/* Header & Metrics */}
      <div className="d-flex justify-content-between align-items-md-center mb-4 flex-column flex-md-row gap-3">
        <div>
          <h2 className="fw-bold mb-1">📦 Platform Orders</h2>
          <p className="text-muted mb-0">Supervise and manage all transactions across NunuaMtaani.</p>
        </div>
        <div className="d-flex gap-3">
          <div className="bg-white px-3 py-2 rounded-3 border shadow-sm flex-fill">
            <span className="text-muted small d-block">Total Orders</span>
            <strong className="fs-5">{orders.length}</strong>
          </div>
          <div className="bg-white px-3 py-2 rounded-3 border shadow-sm flex-fill">
            <span className="text-muted small d-block">Total Volume</span>
            <strong className="fs-5 text-success">
              KES {totalValue.toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-3 border shadow-sm mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          
          {/* Tabs */}
          <div className="d-flex gap-2 flex-wrap">
            {['all', 'pending', 'deliver', 'completed', 'cancelled'].map((tab) => {
              const count = tab === 'all' 
                ? orders.length 
                : orders.filter((o) => o.status === tab).length;
                
              return (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`btn btn-sm text-capitalize ${
                    filterTab === tab ? 'btn-dark' : 'btn-light border'
                  }`}
                  style={{ borderRadius: '20px', padding: '6px 14px' }}
                >
                  {tab} <span className="badge rounded-pill bg-secondary ms-1">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="ms-auto" style={{ minWidth: '240px' }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search ID, Buyer, Shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
          <p className="text-muted mb-0">No matching orders found.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredOrders.map((order) => {
            const userName =
              typeof order.user_id === 'object' && order.user_id !== null
                ? order.user_id.name || order.user_id.username || 'Unknown User'
                : 'Customer';
            const userIdVal =
              typeof order.user_id === 'object' && order.user_id !== null
                ? order.user_id._id
                : order.user_id || 'N/A';

            const shopObj = order.sellerShop || order.shop_id;
            const shopName =
              typeof shopObj === 'object' && shopObj !== null
                ? shopObj.shop_name || 'Unknown Shop'
                : 'Shop';
            const shopIdVal =
              typeof shopObj === 'object' && shopObj !== null
                ? shopObj._id
                : shopObj || 'N/A';

            const selectedStatus = statusUpdates[order._id] || order.status;
            const isPendingChange = selectedStatus !== order.status;
            const isUpdating = updatingMap[order._id];

            return (
              <div key={order._id} className="bg-white p-4 rounded-4 shadow-sm border">
                
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3 flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark font-monospace fs-5">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-muted small">
                      • {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <span className={`badge px-3 py-2 text-uppercase rounded-pill ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                    {order.payment?.status && (
                      <span
                        className={`badge px-3 py-2 rounded-pill ${
                          order.payment.status === 'paid'
                            ? 'bg-success-subtle text-success-emphasis border border-success-subtle'
                            : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                        }`}
                      >
                        Payment: {order.payment.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Buyer & Shop Details */}
                <div className="row mb-3 g-2">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border-start border-primary border-4 h-100">
                      <span className="text-muted small d-block mb-1">Buyer Details</span>
                      <div className="fw-semibold text-dark">{userName}</div>
                      <div className="text-muted font-monospace small text-truncate" style={{ fontSize: '11px' }}>
                        ID: {userIdVal}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border-start border-success border-4 h-100">
                      <span className="text-muted small d-block mb-1">Vendor Shop</span>
                      <div className="fw-semibold text-dark">{shopName}</div>
                      <div className="text-muted font-monospace small text-truncate" style={{ fontSize: '11px' }}>
                        ID: {shopIdVal}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchased Items List */}
                <div className="mb-3 bg-light-subtle rounded-3 p-3 border">
                  <span className="text-muted small fw-bold d-block mb-2 text-uppercase">Items</span>
                  <ul className="list-unstyled mb-0">
                    {(order.items || []).map((item, index) => (
                      <li
                        key={index}
                        className="d-flex justify-content-between align-items-center py-1 border-bottom border-light last-border-0"
                      >
                        <span>
                          <span className="fw-medium">{item.name}</span>{' '}
                          <span className="text-muted ms-1">× {item.quantity}</span>
                        </span>
                        <span className="fw-semibold">
                          KES {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Total & Action Controls */}
                <div className="d-flex justify-content-between align-items-center pt-2 flex-wrap gap-3">
                  <div>
                    <span className="text-muted me-2">Grand Total:</span>
                    <strong className="text-success fs-5">
                      KES {(order.total || 0).toLocaleString()}
                    </strong>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) => handleSelectChange(order._id, e.target.value)}
                      className="form-select form-select-sm"
                      style={{ width: '140px' }}
                      disabled={isUpdating}
                    >
                      <option value="pending">Pending</option>
                      <option value="deliver">Deliver</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      className="btn btn-sm btn-primary px-3"
                      disabled={!isPendingChange || isUpdating}
                      onClick={() => updateStatus(order._id)}
                    >
                      {isUpdating ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        'Update'
                      )}
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