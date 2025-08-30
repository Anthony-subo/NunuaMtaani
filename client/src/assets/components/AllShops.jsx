import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/admin-tables.css';

const API_URL = import.meta.env.VITE_API_URL;

function AllShops() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = () => {
    axios.get(`${API_URL}/api/shops`)
      .then(res => setShops(res.data))
      .catch(err => console.error('Error fetching shops:', err));
  };

  const handleStatusChange = (shopId, newStatus) => {
    setShops(prevShops =>
      prevShops.map(shop =>
        shop._id === shopId ? { ...shop, status: newStatus } : shop
      )
    );
  };

  const handleStatusUpdate = async (shopId, status) => {
    try {
      await axios.put(`${API_URL}/api/shops/${shopId}/status`, { status });
      alert('✅ Status updated');
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('❌ Error updating status');
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
                  <span className={`badge bg-${shop.status === 'success' ? 'success' : shop.status === 'pending' ? 'warning text-dark' : 'danger'}`}>
                    {shop.status || 'pending'}
                  </span>
                </p>

                <div className="mb-2">
                  <label><strong>Change Status:</strong></label>
                  <select
                    className="form-select form-select-sm"
                    value={shop.status || 'pending'}
                    onChange={(e) => handleStatusChange(shop._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleStatusUpdate(shop._id, shop.status)}
                >
                  Update
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllShops;
