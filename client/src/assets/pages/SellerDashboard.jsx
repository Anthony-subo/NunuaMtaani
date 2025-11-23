import React, { useState, useEffect } from "react";
import axios from "axios";
import AllProducts from "../components/AllProducts";
import MyProducts from "../components/MyProducts";
import Orders from "../components/Orders";
import AddProduct from "../components/AddProduct";
import Cart from "../components/Cart";
import MyPurchases from "../components/MyPurchases"; // ✅ ADDED
import Header from "../components/Header";
import Settings from "../components/Settings";
import ShopSettings from "../components/ShopSettings";

// ICONS
import {
  FaStore,
  FaBox,
  FaClipboardList,
  FaPlusCircle,
  FaShoppingCart,
  FaCog,
  FaShoppingBag, // ✅ ADDED
} from "react-icons/fa";

import "../styles/dashboard.css";

function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showShopSettings, setShowShopSettings] = useState(false);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
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
    if (showShopSettings) return <ShopSettings />;

    switch (activeTab) {
      case "all":
        return <AllProducts />;
      case "my":
        return <MyProducts />;
      case "orders":
        return <Orders />;
      case "add":
        return <AddProduct />;
      case "cart":
        return <Cart />;
      case "purchases": // ✅ ADDED
        return <MyPurchases />;
      case "settings":
        return <Settings />;
      default:
        return <AllProducts />;
    }
  };

  return (
    <div className="container dashboard-container">
      <Header />

      {/* Dashboard Header */}
      <div className="dashboard-header text-center py-3 mb-3 flex items-center justify-center gap-2">
        <h2>
          {loading ? (
            <span className="text-muted">Loading Shop Info...</span>
          ) : (
            <span className="text-primary">🏪 {shopName}'s Dashboard</span>
          )}
        </h2>

        {/* Shop Settings icon */}
        {!loading && (
          <button
            className="shop-settings-btn"
            onClick={() => setShowShopSettings(!showShopSettings)}
            title="Shop Settings"
          >
            <FaCog size={20} />
          </button>
        )}
      </div>

      <p className="dashboard-subtext text-center mb-4">
        Manage your products, view orders, track purchases, and adjust settings.
      </p>

      {/* Tabs */}
      {!showShopSettings && (
        <div className="dashboard-tabs">
          <button
            className={activeTab === "all" ? "active" : ""}
            onClick={() => setActiveTab("all")}
            title="All Products"
          >
            <FaStore size={20} />
            <span className="tab-label">All</span>
          </button>

          <button
            className={activeTab === "my" ? "active" : ""}
            onClick={() => setActiveTab("my")}
            title="My Products"
          >
            <FaBox size={20} />
            <span className="tab-label">My Products</span>
          </button>

          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
            title="Orders"
          >
            <FaClipboardList size={20} />
            <span className="tab-label">Orders</span>
          </button>

          <button
            className={activeTab === "add" ? "active" : ""}
            onClick={() => setActiveTab("add")}
            title="Add Product"
          >
            <FaPlusCircle size={20} />
            <span className="tab-label">Add</span>
          </button>

          <button
            className={activeTab === "cart" ? "active" : ""}
            onClick={() => setActiveTab("cart")}
            title="Cart"
          >
            <FaShoppingCart size={20} />
            <span className="tab-label">Cart</span>
          </button>

          {/* ✅ NEW My Purchases Tab */}
          <button
            className={activeTab === "purchases" ? "active" : ""}
            onClick={() => setActiveTab("purchases")}
            title="My Purchases"
          >
            <FaShoppingBag size={20} />
            <span className="tab-label">Purchases</span>
          </button>

          <button
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
            title="User Settings"
          >
            <FaCog size={22} />
            <span className="tab-label">Settings</span>
          </button>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="dashboard-content">{renderTab()}</div>
    </div>
  );
}

export default SellerDashboard;
