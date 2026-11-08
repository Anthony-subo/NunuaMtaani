
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import '../styles/orders.css';

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_OPTIONS = [
  'pending',
  'deliver',
  'completed',
  'cancelled',
];

function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [updatingMap, setUpdatingMap] = useState({});
  const [filterTab, setFilterTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setToastMessage({ msg, type });

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders`);
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        showNotification('Failed to fetch orders from server.', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  const handleSelectChange = (orderId, newStatus) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  const updateStatus = async (orderId) => {
    const newStatus = statusUpdates[orderId];
    if (!newStatus) return;

    setUpdatingMap((prev) => ({
      ...prev,
      [orderId]: true,
    }));

    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, {
        status: newStatus,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      setStatusUpdates((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });

      showNotification('Order status updated successfully.');
    } catch (err) {
      console.error('Failed to update order:', err);
      showNotification('Error updating order status.', 'danger');
    } finally {
      setUpdatingMap((prev) => ({
        ...prev,
        [orderId]: false,
      }));
    }
  };

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesTab =
        filterTab === 'all' || order.status === filterTab;

      const user =
        typeof order.user_id === 'object' && order.user_id
          ? order.user_id.name || order.user_id.username || ''
          : '';

      const shop = order.sellerShop || order.shop_id;

      const shopName =
        typeof shop === 'object' && shop
          ? shop.shop_name || ''
          : '';

      const matchesSearch =
        (order._id || '').toLowerCase().includes(term) ||
        user.toLowerCase().includes(term) ||
        shopName.toLowerCase().includes(term);

      return matchesTab && matchesSearch;
    });
  }, [orders, filterTab, searchTerm]);

  const totalValue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );

  const getCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter((order) => order.status === status).length;
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="orders-spinner"></div>
        <h6>Loading orders</h6>
        <p>Please wait while we retrieve platform transactions.</p>
      </div>
    );
  }

  return (
    <div className="orders-page">

      {/* Notification */}
      {toastMessage && (
        <div className={`orders-toast ${toastMessage.type}`}>
          <span>
            {toastMessage.type === 'success' ? '✓' : '⚠'}
          </span>
          {toastMessage.msg}
          <button
            onClick={() => setToastMessage(null)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="orders-header">
        <div>
          <span className="orders-eyebrow">ADMINISTRATION / SALES</span>
          <h2>Platform Orders</h2>
          <p>
            Monitor, track and manage all transactions across NunuaMtaani.
          </p>
        </div>

        <div className="orders-header-icon">📦</div>
      </div>

      {/* Statistics */}
      <div className="orders-stats">

        <div className="stat-card">
          <div className="stat-icon blue">📦</div>
          <div>
            <span>Total Orders</span>
            <h3>{orders.length.toLocaleString()}</h3>
            <small>All platform transactions</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div>
            <span>Pending Orders</span>
            <h3>{getCount('pending').toLocaleString()}</h3>
            <small>Awaiting processing</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✓</div>
          <div>
            <span>Completed Orders</span>
            <h3>{getCount('completed').toLocaleString()}</h3>
            <small>Successfully completed</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">💰</div>
          <div>
            <span>Total Order Value</span>
            <h3>KES {totalValue.toLocaleString()}</h3>
            <small>Combined order value</small>
          </div>
        </div>

      </div>

      {/* Orders Management */}
      <div className="orders-management">

        <div className="orders-toolbar">
          <div>
            <h4>All Transactions</h4>
            <p>Manage and review customer purchases.</p>
          </div>

          <div className="orders-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search orders, buyers or shops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button onClick={() => setSearchTerm('')}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="orders-tabs">
          {['all', ...STATUS_OPTIONS].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={filterTab === tab ? 'active' : ''}
            >
              {tab === 'all'
                ? 'All Orders'
                : tab.charAt(0).toUpperCase() + tab.slice(1)}

              <span>{getCount(tab)}</span>
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="orders-results">
          Showing <strong>{filteredOrders.length}</strong> of{' '}
          <strong>{orders.length}</strong> orders
        </div>

        {/* Order Cards */}
        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <div>📭</div>
            <h4>No orders found</h4>
            <p>
              Try changing your filters or searching with a different keyword.
            </p>
          </div>
        ) : (
          <div className="orders-list">

            {filteredOrders.map((order) => {
              const user =
                typeof order.user_id === 'object' && order.user_id
                  ? order.user_id
                  : null;

              const shop = order.sellerShop || order.shop_id;

              const shopObject =
                typeof shop === 'object' && shop ? shop : null;

              const userName =
                user?.name || user?.username || 'Unknown Customer';

              const shopName =
                shopObject?.shop_name || 'Unknown Shop';

              const selectedStatus =
                statusUpdates[order._id] || order.status;

              const isPendingChange =
                selectedStatus !== order.status;

              const isUpdating = !!updatingMap[order._id];

              return (
                <article className="order-card" key={order._id}>

                  {/* Order Top */}
                  <div className="order-card-header">

                    <div>
                      <span className="order-reference">
                        ORDER #{(order._id || '').slice(-6).toUpperCase()}
                      </span>

                      <span className="order-date">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : 'Date unavailable'}
                      </span>
                    </div>

                    <div className="order-badges">
                      <span className={getStatusClass(order.status)}>
                        {order.status}
                      </span>

                      {order.payment?.status && (
                        <span
                          className={`payment-badge ${
                            order.payment.status === 'paid'
                              ? 'payment-paid'
                              : 'payment-unpaid'
                          }`}
                        >
                          {order.payment.status === 'paid' ? '✓' : '●'}{' '}
                          {order.payment.status}
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Customer / Shop */}
                  <div className="order-parties">

                    <div className="party-info">
                      <div className="party-icon buyer-icon">👤</div>
                      <div>
                        <span>BUYER</span>
                        <h5>{userName}</h5>
                        <small>
                          ID: {user?._id || order.user_id || 'N/A'}
                        </small>
                      </div>
                    </div>

                    <div className="party-info">
                      <div className="party-icon shop-icon">🏪</div>
                      <div>
                        <span>VENDOR SHOP</span>
                        <h5>{shopName}</h5>
                        <small>
                          ID: {shopObject?._id || shop || 'N/A'}
                        </small>
                      </div>
                    </div>

                  </div>

                  {/* Items */}
                  <div className="order-items">

                    <div className="items-heading">
                      <h6>ORDER ITEMS</h6>
                      <span>{(order.items || []).length} items</span>
                    </div>

                    {(order.items || []).map((item, index) => (
                      <div className="order-item" key={index}>
                        <div>
                          <strong>{item.name || 'Product'}</strong>
                          <span>Quantity: {item.quantity || 0}</span>
                        </div>

                        <strong>
                          KES {(
                            Number(item.price || 0) *
                            Number(item.quantity || 0)
                          ).toLocaleString()}
                        </strong>
                      </div>
                    ))}

                  </div>

                  {/* Footer */}
                  <div className="order-card-footer">

                    <div className="order-total">
                      <span>ORDER TOTAL</span>
                      <h3>
                        KES {Number(order.total || 0).toLocaleString()}
                      </h3>
                    </div>

                    <div className="order-actions">
                      <label htmlFor={`status-${order._id}`}>
                        Update Status
                      </label>

                      <div className="status-controls">
                        <select
                          id={`status-${order._id}`}
                          value={selectedStatus}
                          onChange={(e) =>
                            handleSelectChange(order._id, e.target.value)
                          }
                          disabled={isUpdating}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => updateStatus(order._id)}
                          disabled={!isPendingChange || isUpdating}
                        >
                          {isUpdating ? (
                            <>
                              <span className="button-spinner"></span>
                              Saving
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default AllOrders;
