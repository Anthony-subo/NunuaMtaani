import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/addProduct.css';

const API_URL = import.meta.env.VITE_API_URL;

function AddProduct() {
  const [form, setForm] = useState({
    shop_id: '',
    name: '',
    price: '',
    location: '',
    status: 'available',
  });

  const [imageFiles, setImageFiles] = useState([null, null, null, null]);
  const [imagePreviews, setImagePreviews] = useState(['', '', '', '']);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user._id) return setMessage('❌ User not found. Please log in.');

        const res = await axios.get(`${API_URL}/api/shops/user/${user._id}`);
        setForm(prev => ({ ...prev, shop_id: res.data.shop._id }));
        setShopName(res.data.shop.shop_name);
      } catch (err) {
        setMessage('❌ Failed to fetch your shop details.');
      }
    };
    fetchShopInfo();
  }, [API_URL]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (index, file) => {
    const updatedFiles = [...imageFiles];
    updatedFiles[index] = file;
    setImageFiles(updatedFiles);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      const updatedPreviews = [...imagePreviews];
      updatedPreviews[index] = previewUrl;
      setImagePreviews(updatedPreviews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const selectedImages = imageFiles.filter(file => file !== null);
    if (selectedImages.length === 0) {
      setMessage('❌ Please upload at least 1 image of your product.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      selectedImages.forEach(file => formData.append('images', file));
      formData.append('timestamp', new Date().toISOString());

      const res = await axios.post(`${API_URL}/api/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status === 'success' || res.status === 201 || res.status === 200) {
        setMessage('✅ Product published successfully!');
        setForm({
          shop_id: form.shop_id,
          name: '',
          price: '',
          location: '',
          status: 'available',
        });
        setImageFiles([null, null, null, null]);
        setImagePreviews(['', '', '', '']);
      } else {
        setMessage('❌ Failed to add product.');
      }
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Server error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '750px' }}>
      <div className="add-product-card shadow-lg p-4 bg-white rounded-4 border-0">
        
        {/* Banner Section */}
        <div className="text-center mb-4 pb-3 border-bottom">
          <span className="fs-1">📦</span>
          <h3 className="fw-bold mt-2">Add New Product</h3>
          <p className="text-muted mb-0">
            Listing for: <strong className="text-primary">{shopName || 'Your Shop'}</strong>
          </p>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} text-center py-2`} role="alert">
            {message}
          </div>
        )}

        <form className="add-product-form" onSubmit={handleSubmit} encType="multipart/form-data">
          
          {/* Product Name */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Product Name</label>
            <input 
              type="text" 
              name="name" 
              className="form-control form-control-lg" 
              placeholder="e.g. Wireless Bluetooth Earbuds" 
              value={form.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* Price & Location Row */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Price (KES)</label>
              <input 
                type="number" 
                name="price" 
                className="form-control" 
                placeholder="e.g. 1500" 
                value={form.price} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Location / Pickup Point</label>
              <input 
                type="text" 
                name="location" 
                className="form-control" 
                placeholder="e.g. Nairobi CBD" 
                value={form.location} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Status Selection */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Initial Status</label>
            <select name="status" className="form-select" value={form.status} onChange={handleChange}>
              <option value="available">Available (In Stock)</option>
              <option value="sold">Sold Out</option>
            </select>
          </div>

          {/* Image Upload Grid with Thumbnails */}
          <div className="mb-4">
            <label className="form-label fw-semibold d-block">
              Product Images <span className="text-muted small">(At least 1 required, up to 4)</span>
            </label>
            <div className="row g-3">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="col-6 col-md-3">
                  <div className="border rounded-3 p-2 text-center position-relative bg-light" style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    {imagePreviews[i] ? (
                      <img 
                        src={imagePreviews[i]} 
                        alt="Preview" 
                        className="w-100 h-100 position-absolute top-0 start-0 object-fit-cover rounded-3" 
                      />
                    ) : (
                      <label role="button" className="w-100 h-100 d-flex flex-column justify-content-center align-items-center text-muted" style={{ cursor: 'pointer' }}>
                        <span className="fs-4">📷</span>
                        <span className="small mt-1">Slot {i + 1}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="d-none" 
                          onChange={(e) => handleImageChange(i, e.target.files[0])} 
                        />
                      </label>
                    )}
                    {imagePreviews[i] && (
                      <button 
                        type="button" 
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-1 lh-1"
                        style={{ width: '24px', height: '24px', fontSize: '10px', zIndex: 5 }}
                        onClick={() => {
                          const newFiles = [...imageFiles];
                          newFiles[i] = null;
                          setImageFiles(newFiles);
                          const newPreviews = [...imagePreviews];
                          newPreviews[i] = '';
                          setImagePreviews(newPreviews);
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-success btn-lg w-100 py-3 fw-bold shadow-sm"
            disabled={loading}
          >
            {loading ? '⏳ Publishing Product...' : '🚀 Publish Product'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default AddProduct;