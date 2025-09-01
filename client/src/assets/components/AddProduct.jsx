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

  const [message, setMessage] = useState('');

  // ✅ Use backend API URL from .env
  const API_URL = import.meta.env.VITE_API_URL;

  // Auto-fetch shop_id from logged-in user
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

  // ✅ Convert images to Base64
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    });

    const base64Images = await Promise.all(promises);
    setForm(prev => ({ ...prev, images: base64Images }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (form.images.length === 0) {
      setMessage('❌ Please upload at least 1 image');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/products`, form);

      if (res.data.status === 'success' || res.status === 201) {
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
      } else {
        setMessage('❌ Failed to add product');
      }
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div className="add-product-card">
      <div className="add-product-banner">
        <span role="img" aria-label="cart" className="cart-icon">🛒</span>
        <h4>Add Your Best Product Today!</h4>
        <p className="slogan-text">Let customers discover your shop’s top picks!</p>
      </div>

      {message && <div className="add-product-alert">{message}</div>}

      <form className="add-product-form" onSubmit={handleSubmit}>
        <input type="text" value={form.shop_id} disabled readOnly />

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />

        <label>Product Images (At least 1, multiple allowed)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
        </select>

        <button type="submit" className="btn-primary">Submit Product</button>
      </form>
    </div>
  );
}

export default AddProduct;
