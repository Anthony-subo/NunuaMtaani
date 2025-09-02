import React, { useState, useEffect } from 'react';
import AllProducts from '../components/AllProducts';
import Cart from '../components/Cart';
import MyPurchases from '../components/MyPurchases';
import Header from '../components/Header';
import { FaStore, FaShoppingCart, FaBoxOpen } from 'react-icons/fa';
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
      default:
        return <AllProducts />;
    }
  };

  return (
    <div className="container dashboard-container">
      <Header />
      {/* Tabs (works for both desktop and mobile) */}
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
      </div>

      {/* Dashboard Header */}
      <div className="dashboard-header text-center py-3 mb-3">
        <h2 className="fw-bold">
          {buyerName ? (
            <span className="text-success">🛍️ Welcome, {buyerName}!</span>
          ) : (
            'Welcome to Your Dashboard'
          )}
        </h2>
        {location && (
          <p className="dashboard-subtext mb-1">
            📍 <strong>Location:</strong> {location}
          </p>
        )}
        <p className="dashboard-subtext small text-muted">
          Browse local products, add them to your cart, and enjoy shopping within your area!
        </p>
      </div>

      <div className="dashboard-content container">{renderTab()}</div>
    </div>
  );
}

export default BuyerDashboard;
