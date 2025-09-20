import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/shopsettings.css";

function ShopSettings() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?._id) return;

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/shops/user/${user._id}`
        );

        setShop(res.data.shop);
      } catch (err) {
        console.error("Failed to fetch shop:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, []);

  if (loading) return <p className="loading">Loading shop settings...</p>;
  if (!shop) return <p className="error">No shop data found.</p>;

  const renderBadge = (type, value) => {
    let badgeClass = "status-badge";

    if (type === "subscription") {
      if (value === "active") badgeClass += " active";
      else if (value === "grace") badgeClass += " grace";
      else badgeClass += " inactive";
    }

    if (type === "visibility") {
      badgeClass += value === "Visible" ? " active" : " inactive";
    }

    return <span className={badgeClass}>{value}</span>;
  };

  return (
    <div className="shop-settings">
      <h3>⚙️ Shop Settings</h3>

      <div className="shop-info">
        <p><strong>Shop Name:</strong> {shop.shop_name}</p>
        <p><strong>Owner:</strong> {shop.owner_name}</p>
        <p><strong>Email:</strong> {shop.email}</p>
        <p><strong>Location:</strong> {shop.location}</p>
        <p><strong>Payment Method:</strong> {shop.payment_method}</p>
        <p><strong>Payment Number:</strong> {shop.payment_number}</p>
        <p><strong>Commission Rate:</strong> {shop.commission_rate * 100}%</p>
        <p><strong>Visibility:</strong> {renderBadge("visibility", shop.isVisible ? "Visible" : "Hidden")}</p>
      </div>

      <div className="subscription-box">
        <h4>📦 Subscription</h4>
        <p><strong>Status:</strong> {renderBadge("subscription", shop.subscription?.status)}</p>
        <p><strong>Plan:</strong> {shop.subscription?.plan}</p>
        <p><strong>Created At:</strong> {new Date(shop.createdAt).toLocaleString()}</p>
        <p><strong>Updated At:</strong> {new Date(shop.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default ShopSettings;
