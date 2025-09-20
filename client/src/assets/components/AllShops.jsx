import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/admin-tables.css';

const API_URL = import.meta.env.VITE_API_URL;

function AllShops() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    fetchShops();
  }, []);

  // ✅ Fetch all shops
  const fetchShops = () => {
    axios.get(`${API_URL}/api/shops`)
      .then(res => setShops(res.data))
      .catch(err => console.error('Error fetching shops:', err));
  };

  // ✅ Change dropdown value locally
  const handleStatusChange = (shopId, newStatus) => {
    setShops(prevShops =>
      prevShops.map(shop =>
        shop._id === shopId
          ? { ...shop, subscription: { ...shop.subscription, status: newStatus } }
          : shop
      )
    );
  };

  // ✅ Save new status to backend
  const handleStatusUpdate = async (shopId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/shops/${shopId}/status`, { status: newStatus });
      alert('✅ Status updated');
      fetchShops();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('❌ Error updating status');
    }
  };

  // ✅ Delete shop
  const handleDelete = async (shopId) => {
    if (!window.confirm("Are you sure you want to delete this shop?")) return;
    try {
      await axios.delete(`${API_URL}/api/shops/${shopId}`);
      setShops(prevShops => prevShops.filter(shop => shop._id !== shopId));
      alert('🗑️ Shop deleted successfully');
    } catch (err) {
      console.error('Failed to delete shop:', err);
      alert('❌ Error deleting shop');
    }
  };

  return (
    <div className="admin-table-container">
      <h4>All Shops</h4>
      <div style={{ overflowX: 'auto' }}>
        {shops.length === 0 ? (
          <p className="text-muted">No shops found.</p>
        ) : (
          <div className="shop-cards-container">
            {shops.map((shop) => (
              <div key={shop._id} className="shop-card shadow-sm">
                <h5>{shop.shop_name}</h5>
                <p className="mb-1"><strong>Owner:</strong> {shop.owner_name}</p>
                <p className="mb-1"><strong>Email:</strong> {shop.email}</p>
                <p className="mb-1"><strong>Location:</strong> {shop.location}</p>
                <p className="mb-1">
                  <strong>Status:</strong>{" "}
                  <span className={`badge bg-${
                    shop.subscription?.status === 'active'
                      ? 'success'
                      : shop.subscription?.status === 'grace'
                      ? 'warning text-dark'
                      : 'danger'
                  }`}>
                    {shop.subscription?.status || 'inactive'}
                  </span>
                </p>

                <div className="mb-2">
                  <label><strong>Change Status:</strong></label>
                  <select
                    className="form-select form-select-sm"
                    value={shop.subscription?.status || 'inactive'}
                    onChange={(e) => handleStatusChange(shop._id, e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="grace">Grace</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleStatusUpdate(shop._id, shop.subscription?.status)}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(shop._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllShops;
