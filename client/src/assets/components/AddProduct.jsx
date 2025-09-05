import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/addProduct.css';

function AddProduct() {
  const [form, setForm] = useState({
    shop_id: '',
    name: '',
    price: '',
    location: '',
    images: [],
    status: 'available',
    timestamp: new Date().toISOString()
  });

  const [imageFiles, setImageFiles] = useState([null, null, null, null]);
  const [message, setMessage] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchShopId = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user._id) return setMessage('❌ User not found');

        const res = await axios.get(`${API_URL}/api/shops/user/${user._id}`);
        setForm(prev => ({ ...prev, shop_id: res.data.shop._id }));
      } catch (err) {
        setMessage('❌ Failed to fetch shop ID');
      }
    };
    fetchShopId();
  }, [API_URL]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (index, file) => {
    const updated = [...imageFiles];
    updated[index] = file;
    setImageFiles(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const selectedImages = imageFiles.filter(file => file !== null);
    if (selectedImages.length === 0) {
      setMessage('❌ Please upload at least 1 image');
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      selectedImages.forEach(file => formData.append('images', file));

      const res = await axios.post(`${API_URL}/api/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status === 'success') {
        setMessage('✅ Product added successfully!');
        setForm({
          shop_id: form.shop_id,
          name: '',
          price: '',
          location: '',
          images: [],
          status: 'available',
          timestamp: new Date().toISOString()
        });
        setImageFiles([null, null, null, null]);
      } else {
        setMessage('❌ Failed to add product');
      }
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div className="add-product-card shadow-lg">
      <div className="add-product-banner">
        <span role="img" aria-label="cart" className="cart-icon">🛒</span>
        <h4>Add Your Best Product Today!</h4>
        <p className="slogan-text">Let customers discover your shop’s top picks!</p>
      </div>

      {message && <div className="add-product-alert">{message}</div>}

      <form className="add-product-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" value={form.shop_id} disabled readOnly className="readonly-input" />

        <input type="text" name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} required />

        <label className="upload-label">Product Images (At least 1, up to 4)</label>
        <div className="upload-grid">
          {[0, 1, 2, 3].map(i => (
            <input key={i} type="file" accept="image/*" onChange={(e) => handleImageChange(i, e.target.files[0])} />
          ))}
        </div>

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
        </select>

        <button type="submit" className="btn-submit">✅ Submit Product</button>
      </form>
    </div>
  );
}

export default AddProduct;
