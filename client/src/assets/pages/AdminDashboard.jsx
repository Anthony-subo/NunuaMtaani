import React, { useState, useEffect } from 'react';
import AllProducts from '../components/AllProducts';
import AllUsers from '../components/AllUsers';
import AllShops from '../components/AllShops';
import Cart from '../components/Cart'; // Only one import
import AllOrders from '../components/AllOrders.jsx'; // You must have this component
import Header from "../components/Header";
import '../styles/dashboard.css'; // Adjust path as needed

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
      case 'products':
        return <AllProducts isAdminView={true} />;
      case 'users':
        return <AllUsers />;
      case 'shops':
        return <AllShops />;
      case 'cart':
        return <Cart />;
      case 'orders':
        return <AllOrders />; // Admin orders tab
      default:
        return <AllProducts isAdminView={true} />;
    }
  };

  return (
    <div className="container dashboard-container">
      <Header />

      <div className="dashboard-tabs">
        <button
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('products')}
        >
          All Products
        </button>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-secondary' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          All Users
        </button>
        <button
          className={`btn ${activeTab === 'shops' ? 'btn-warning' : 'btn-outline-warning'}`}
          onClick={() => setActiveTab('shops')}
        >
          All Shops
        </button>
        <button
          className={`btn ${activeTab === 'cart' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => setActiveTab('cart')}
        >
          Carts
        </button>
        <button
          className={`btn ${activeTab === 'orders' ? 'btn-dark' : 'btn-outline-dark'}`}
          onClick={() => setActiveTab('orders')}
        >
          All Orders
        </button>
      </div>

      <div className="dashboard-header">
        <h2>
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

      <div>{renderTab()}</div>
    </div>
  );
}

export default AdminDashboard;
