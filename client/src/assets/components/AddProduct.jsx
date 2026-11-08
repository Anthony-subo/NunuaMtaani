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
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
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
      setActivePreviewIndex(index);
    }
  };

  const removeImage = (index, e) => {
    e.stopPropagation();
    const updatedFiles = [...imageFiles];
    updatedFiles[index] = null;
    setImageFiles(updatedFiles);

    const updatedPreviews = [...imagePreviews];
    updatedPreviews[index] = '';
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const selectedImages = imageFiles.filter(file => file !== null);
    if (selectedImages.length === 0) {
      setMessage('❌ Please upload at least 1 image.');
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
        setMessage('🎉 Product published to marketplace!');
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

  // Find primary image for live card preview
  const activeImage = imagePreviews.find(img => img !== '') || 'https://via.placeholder.com/400x300?text=Upload+Product+Photo';

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header Title */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontWeight: '800', color: '#1a1d20', marginBottom: '6px' }}>✨ Create Marketplace Listing</h2>
          <p style={{ color: '#6c757d' }}>
            Publishing as: <strong style={{ color: '#0d6efd' }}>{shopName || 'Your Shop'}</strong>
          </p>
        </div>

        {message && (
          <div style={{
            padding: '14px',
            borderRadius: '12px',
            marginBottom: '25px',
            background: message.includes('🎉') ? '#d1e7dd' : '#f8d7da',
            color: message.includes('🎉') ? '#0f5132' : '#842029',
            fontWeight: '600'
          }}>
            {message}
          </div>
        )}

        {/* Split Panel Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
          
          {/* LEFT PANEL: Form Inputs */}
          <div style={{ background: '#ffffff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <form onSubmit={handleSubmit}>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px', color: '#333' }}>Product Title</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Nike Air Max 270"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e0e0e0', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px', color: '#333' }}>Price (KES)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="e.g. 3500"
                    value={form.price}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e0e0e0', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px', color: '#333' }}>Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Roysambu"
                    value={form.location}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e0e0e0', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px', color: '#333' }}>Inventory Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e0e0e0', background: '#fff' }}
                >
                  <option value="available">🟢 Available in Stock</option>
                  <option value="sold">🔴 Sold Out</option>
                </select>
              </div>

              {/* Photo Upload Slots */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px', color: '#333' }}>Upload Photos (1-4)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      style={{
                        position: 'relative',
                        height: '75px',
                        borderRadius: '10px',
                        border: '2px dashed #d0d7de',
                        background: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                    >
                      {imagePreviews[i] ? (
                        <>
                          <img src={imagePreviews[i]} alt="slot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={(e) => removeImage(i, e)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <label style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <span style={{ fontSize: '18px' }}>📷</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleImageChange(i, e.target.files[0])}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: loading ? '#6c757d' : '#198754',
                  color: '#ffffff',
                  fontWeight: '700',
                  border: 'none',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(25, 135, 84, 0.3)'
                }}
              >
                {loading ? 'Publishing Product...' : '🚀 Publish Product'}
              </button>

            </form>
          </div>

          {/* RIGHT PANEL: Live Marketplace Buyer Preview */}
          <div>
            <div style={{ position: 'sticky', top: '20px' }}>
              <h5 style={{ fontWeight: '700', color: '#6c757d', marginBottom: '15px' }}>👁️ Customer Preview</h5>
              <div style={{ background: '#ffffff', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
                
                {/* Shop Badge */}
                <div style={{ padding: '12px 18px', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#333' }}>{shopName || 'Shop Name'}</span>
                  <span style={{ fontSize: '12px', background: '#e1f5fe', color: '#0288d1', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>Verified</span>
                </div>

                {/* Main Product Image */}
                <div style={{ height: '240px', background: '#f0f0f0', position: 'relative' }}>
                  <img src={activeImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {form.status === 'sold' && (
                    <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#dc3545', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                      SOLD OUT
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ padding: '20px' }}>
                  <h4 style={{ fontWeight: '700', margin: '0 0 8px 0', fontSize: '18px' }}>{form.name || 'Your Product Title'}</h4>
                  <p style={{ margin: '0 0 10px 0', color: '#6c757d', fontSize: '13px' }}>📍 {form.location || 'Location'}</p>
                  <h3 style={{ color: '#0d6efd', fontWeight: '800', margin: '0 0 15px 0' }}>{form.price ? `${form.price} KES` : '0 KES'}</h3>
                  
                  <button style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#f0f2f5', color: '#333', border: '1px solid #ccc', fontWeight: '600', cursor: 'not-allowed' }}>
                    🛒 Add to Cart (Preview)
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AddProduct;