import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AllProducts from '../components/AllProducts';
import MyProducts from '../components/MyProducts';
import Orders from '../components/Orders';
import AddProduct from '../components/AddProduct';
import Cart from '../components/Cart';
import Header from "../components/Header";
import { FaStore, FaBox, FaClipboardList, FaPlusCircle, FaShoppingCart } from 'react-icons/fa';
import '../styles/dashboard.css';

function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchShop = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?._id) return;

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shops/user/${user._id}`
      );

      setShopName(res.data.shop.shop_name);
    } catch (err) {
      console.error("Failed to fetch shop:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchShop();
}, []);


  const renderTab = () => {
    switch (activeTab) {
      case 'all': return <AllProducts />;
      case 'my': return <MyProducts />;
      case 'orders': return <Orders />;
      case 'add': return <AddProduct />;
      case 'cart': return <Cart />;
      default: return <AllProducts />;
    }
  };

  return (
    <div className="dashboard-container">
      <Header />

      {/* Tabs (desktop top, mobile bottom) */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
          title="All Products"
        >
          <FaStore size={20} />
          <span className="tab-label">All</span>
        </button>
        <button
          className={activeTab === 'my' ? 'active' : ''}
          onClick={() => setActiveTab('my')}
          title="My Products"
        >
          <FaBox size={20} />
          <span className="tab-label">My Products</span>
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
          title="Orders"
        >
          <FaClipboardList size={20} />
          <span className="tab-label">Orders</span>
        </button>
        <button
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => setActiveTab('add')}
          title="Add Product"
        >
          <FaPlusCircle size={20} />
          <span className="tab-label">Add</span>
        </button>
        <button
          className={activeTab === 'cart' ? 'active' : ''}
          onClick={() => setActiveTab('cart')}
          title="Cart"
        >
          <FaShoppingCart size={20} />
          <span className="tab-label">Cart</span>
        </button>
      </div>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h2>
          {loading
            ? <span className="text-muted">Loading Shop Info...</span>
            : <span className="text-primary">🏪 {shopName}'s Dashboard</span>
          }
        </h2>
        <p className="dashboard-subtext">
          Manage your products, view orders, and grow your store!
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {renderTab()}
      </div>
    </div>
  );
}

export default SellerDashboard;
