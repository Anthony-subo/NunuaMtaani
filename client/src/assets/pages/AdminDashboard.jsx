import React, { useState, useEffect } from 'react';
import AllProducts from '../components/AllProducts';
import AllUsers from '../components/AllUsers';
import AllShops from '../components/AllShops';
import Cart from '../components/Cart';
import AllOrders from '../components/AllOrders.jsx';
import Header from "../components/Header";
import { FaBoxOpen, FaUsers, FaStore, FaShoppingCart, FaClipboardList } from 'react-icons/fa';
import '../styles/dashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role === 'admin') {
      setAdminName(user.name);
      setEmail(user.email || '');
    }
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'products': return <AllProducts isAdminView={true} />;
      case 'users': return <AllUsers />;
      case 'shops': return <AllShops />;
      case 'cart': return <Cart />;
      case 'orders': return <AllOrders />;
      default: return <AllProducts isAdminView={true} />;
    }
  };

  return (
    <div className="container dashboard-container">
      <Header />

      {/* Admin Tabs (desktop top, mobile bottom) */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
          title="All Products"
        >
          <FaBoxOpen size={20} />
          <span className="tab-label">Products</span>
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
          title="All Users"
        >
          <FaUsers size={20} />
          <span className="tab-label">Users</span>
        </button>
        <button
          className={activeTab === 'shops' ? 'active' : ''}
          onClick={() => setActiveTab('shops')}
          title="All Shops"
        >
          <FaStore size={20} />
          <span className="tab-label">Shops</span>
        </button>
        <button
          className={activeTab === 'cart' ? 'active' : ''}
          onClick={() => setActiveTab('cart')}
          title="Carts"
        >
          <FaShoppingCart size={20} />
          <span className="tab-label">Carts</span>
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
          title="All Orders"
        >
          <FaClipboardList size={20} />
          <span className="tab-label">Orders</span>
        </button>
      </div>

      {/* Dashboard Header */}
      <div className="dashboard-header text-center py-3 mb-3">
        <h2 >
          {adminName ? (
            <span className="text-success">🛡️ Welcome, {adminName} (Admin)</span>
          ) : (
            <span className="text-muted">Admin Dashboard</span>
          )}
        </h2>
        <p className="dashboard-subtext">
          Manage users, monitor shops, view carts, handle orders, and control platform operations.
        </p>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {renderTab()}
      </div>
    </div>
  );
}

export default AdminDashboard;
