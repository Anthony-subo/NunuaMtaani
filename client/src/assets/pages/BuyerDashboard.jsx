import React, { useState, useEffect } from 'react';
import AllProducts from '../components/AllProducts';
import Cart from '../components/Cart';
import MyPurchases from '../components/MyPurchases';
import Settings from '../components/Settings'; // ✅ new
import Header from '../components/Header';
import { FaStore, FaShoppingCart, FaBoxOpen, FaCog } from 'react-icons/fa'; // ✅ add FaCog
import '../styles/dashboard.css';

function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [buyerName, setBuyerName] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'buyer') {
      window.location.href = '/login';
    } else {
      setBuyerName(user.name);
      setLocation(user.location || '');
    }
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'all':
        return <AllProducts />;
      case 'cart':
        return <Cart />;
      case 'purchases':
        return <MyPurchases />;
      case 'settings': // ✅ new case
        return <Settings />;
      default:
        return <AllProducts />;
    }
  };

  return (
    <div className="container dashboard-container">
      <Header />
      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
          title="All Products"
        >
          <FaStore size={22} />
          <span className="tab-label">All Products</span>
        </button>
        <button
          className={activeTab === 'cart' ? 'active' : ''}
          onClick={() => setActiveTab('cart')}
          title="My Cart"
        >
          <FaShoppingCart size={22} />
          <span className="tab-label">My Cart</span>
        </button>
        <button
          className={activeTab === 'purchases' ? 'active' : ''}
          onClick={() => setActiveTab('purchases')}
          title="My Purchases"
        >
          <FaBoxOpen size={22} />
          <span className="tab-label">Purchases</span>
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
          title="Settings"
        >
          <FaCog size={22} />
          <span className="tab-label">Settings</span>
        </button>
      </div>

      {/* Dashboard Header */}
      <div className="dashboard-header text-center py-3 mb-3">
        <h2>
          {buyerName ? (
            <span className="text-success">🛍️ Welcome, {buyerName}!</span>
          ) : (
            'Welcome to Your Dashboard'
          )}
        </h2>
        <p className="dashboard-subtext small text-muted">
          Browse local products, add them to your cart, and enjoy shopping within your area!
        </p>
      </div>

      <div className="dashboard-content container">{renderTab()}</div>
    </div>
  );
}

export default BuyerDashboard;
