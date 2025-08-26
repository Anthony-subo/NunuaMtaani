import React, { useState, useEffect } from 'react';
import AllProducts from '../components/AllProducts';
import Cart from '../components/Cart';
import MyPurchases from '../components/MyPurchases';
import Header from '../components/Header';
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
    <div className="buyer-dashboard">
      <Header />

       <div className="dashboard-tabs d-flex justify-content-center mb-4">
        <button
          className={`btn mx-1 ${activeTab === 'all' ? 'btn-outline-primary active' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('all')}
        >
          🛒 All Products
        </button>
        <button
          className={`btn mx-1 ${activeTab === 'cart' ? 'btn-outline-success active' : 'btn-outline-success'}`}
          onClick={() => setActiveTab('cart')}
        >
          🧺 My Cart
        </button>
        <button
          className={`btn mx-1 ${activeTab === 'purchases' ? 'btn-outline-warning active' : 'btn-outline-warning'}`}
          onClick={() => setActiveTab('purchases')}
        >
          📦 My Purchases
        </button>
      </div>

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
