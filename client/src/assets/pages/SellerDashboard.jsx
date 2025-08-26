import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AllProducts from '../components/AllProducts';
import MyProducts from '../components/MyProducts';
import Orders from '../components/Orders';
import AddProduct from '../components/AddProduct';
import Cart from '../components/Cart';
import Header from "../components/Header";
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
        const res = await axios.get(`http://localhost:3001/api/shops/user/${user._id}`);
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

      <div className="dashboard-tabs">
        <button className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('all')}>All Products</button>
        <button className={`btn ${activeTab === 'my' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('my')}>My Products</button>
        <button className={`btn ${activeTab === 'orders' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setActiveTab('orders')}>Orders</button>
        <button className={`btn ${activeTab === 'add' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setActiveTab('add')}>Add Product</button>
        <button className={`btn ${activeTab === 'cart' ? 'btn-info text-white' : 'btn-outline-info'}`} onClick={() => setActiveTab('cart')}>Cart</button>
      </div>

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

      <div className="dashboard-content">
        {renderTab()}
      </div>
    </div>
  );
}

export default SellerDashboard;
