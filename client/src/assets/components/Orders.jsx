
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../styles/orders.css';

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_OPTIONS = [
  'pending',
  'deliver',
  'completed',
  'cancelled',
];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [updatingMap, setUpdatingMap] = useState({});
  const [filterTab, setFilterTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setToastMessage({ msg, type });
  };

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Fetch shop and its orders
  useEffect(() => {
    let mounted = true;

    const fetchShopAndOrders = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (!user?._id) {
          throw new Error('Please log in to access your shop orders.');
        }

        const shopRes = await axios.get(
          `${API_URL}/api/shops/user/${user._id}`
        );

        const shop = shopRes.data?.shop;

        if (!shop?._id) {
          throw new Error('No shop was found for this account.');
        }

        if (mounted) {
          setShopName(shop.shop_name || 'My Shop');
        }

        const orderRes = await axios.get(
          `${API_URL}/api/orders/seller/${shop._id}`
        );

        if (mounted) {
          setOrders(Array.isArray(orderRes.data) ? orderRes.data : []);
        }
      } catch (err) {
        console.error('Failed to fetch shop orders:', err);

        if (mounted) {
          showNotification(
            err.response?.data?.message ||
            err.message ||
            'Failed to load shop orders.',
            'danger'
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchShopAndOrders();

    return () => {
      mounted = false;
    };
  }, []);

  // Status selection
  const handleSelectChange = (orderId, newStatus) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  // Update order status
  const updateStatus = async (orderId) => {
    const newStatus = statusUpdates[orderId];

    if (!newStatus) return;

    setUpdatingMap((prev) => ({
      ...prev,
      [orderId]: true,
    }));

    try {
      await axios.put(
        `${API_URL}/api/orders/${orderId}/status`,
        { status: newStatus }
      );

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

      showNotification(
        err.response?.data?.message || 'Error updating order status.',
        'danger'
      );
    } finally {
      setUpdatingMap((prev) => ({
        ...prev,
        [orderId]: false,
      }));
    }
  };

  // Order counts
  const getCount = (status) => {
    if (status === 'all') return orders.length;

    return orders.filter((order) => order.status === status).length;
  };

  // Search and filter
  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesTab =
        filterTab === 'all' || order.status === filterTab;

      const buyer =
        typeof order.user_id === 'object' && order.user_id
          ? order.user_id.name || order.user_id.username || ''
          : '';

      const itemNames = (order.items || [])
        .map((item) => item.name || '')
        .join(' ');

      const matchesSearch =
        (order._id || '').toLowerCase().includes(term) ||
        buyer.toLowerCase().includes(term) ||
        itemNames.toLowerCase().includes(term);

      return matchesTab && matchesSearch;
    });
  }, [orders, filterTab, searchTerm]);

  // Total order value
  const totalValue = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );
  }, [orders]);

  const getStatusClass = (status) => {
    return `status-badge status-${status || 'pending'}`;
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="orders-spinner"></div>
        <h6>Loading shop orders...</h6>
        <p>Please wait while we retrieve your transactions.</p>
      </div>
    );
  }

  return (
    <div className="orders-page seller-orders-page">

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

      {/* Header */}
      <div className="orders-header">
        <div>
          <span className="orders-eyebrow">
            SELLER DASHBOARD / ORDER MANAGEMENT
          </span>

          <h2>{shopName} - Orders</h2>

          <p>
            Track customer purchases, manage fulfillment and keep your
            shop running smoothly.
          </p>
        </div>

        <div className="orders-header-icon">🛍️</div>
      </div>

      {/* Statistics */}
      <div className="orders-stats">

        <div className="stat-card">
          <div className="stat-icon blue">📦</div>

          <div>
            <span>Total Orders</span>
            <h3>{orders.length.toLocaleString()}</h3>
            <small>All shop orders</small>
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

      {/* Management Section */}
      <div className="orders-management">

        <div className="orders-toolbar">

          <div>
            <h4>Shop Transactions</h4>
            <p>View and manage orders placed at your shop.</p>
          </div>

          <div className="orders-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search order, buyer or product..."
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

        {/* Filters */}
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

        {/* Results Count */}
        <div className="orders-results">
          Showing <strong>{filteredOrders.length}</strong> of{' '}
          <strong>{orders.length}</strong> shop orders
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (

          <div className="orders-empty">
            <div>📭</div>

            <h4>No orders found</h4>

            <p>
              {orders.length === 0
                ? 'You have not received any orders yet.'
                : 'Try changing your filters or search keyword.'}
            </p>
          </div>

        ) : (

          <div className="orders-list">

            {filteredOrders.map((order) => {

              const buyer =
                typeof order.user_id === 'object' && order.user_id
                  ? order.user_id
                  : null;

              const buyerName =
                buyer?.name || buyer?.username || 'Customer';

              const selectedStatus =
                statusUpdates[order._id] || order.status;

              const isPendingChange =
                selectedStatus !== order.status;

              const isUpdating = !!updatingMap[order._id];

              const items = Array.isArray(order.items)
                ? order.items
                : [];

              return (
                <article className="order-card" key={order._id}>

                  {/* Order Header */}
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
                        {order.status || 'pending'}
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

                  {/* Buyer Information */}
                  <div className="order-parties">

                    <div className="party-info">

                      <div className="party-icon buyer-icon">
                        👤
                      </div>

                      <div>
                        <span>CUSTOMER / BUYER</span>

                        <h5>{buyerName}</h5>

                        <small>
                          ID: {buyer?._id || order.user_id || 'N/A'}
                        </small>
                      </div>

                    </div>

                    <div className="party-info">

                      <div className="party-icon shop-icon">
                        🏪
                      </div>

                      <div>
                        <span>SELLER SHOP</span>

                        <h5>{shopName}</h5>

                        <small>Your shop order</small>
                      </div>

                    </div>

                  </div>

                  {/* Purchased Items */}
                  <div className="order-items">

                    <div className="items-heading">
                      <h6>ORDER ITEMS</h6>
                      <span>{items.length} items</span>
                    </div>

                    {items.length === 0 ? (
                      <p className="text-muted small mb-0">
                        No item details available.
                      </p>
                    ) : (
                      items.map((item, index) => (

                        <div className="order-item" key={index}>

                          <div>
                            <strong>{item.name || 'Product'}</strong>

                            <span>
                              Quantity: {item.quantity || 0}
                            </span>
                          </div>

                          <strong>
                            KES {(
                              Number(item.price || 0) *
                              Number(item.quantity || 0)
                            ).toLocaleString()}
                          </strong>

                        </div>

                      ))
                    )}

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
                        Manage Order Status
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

export default Orders;
