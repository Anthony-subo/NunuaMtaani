import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/addProduct.css';

function AddProduct() {
  const [form, setForm] = useState({
    shop_id: '',
    name: '',
    price: '',
    location: '',
    status: 'available',
  });
  const [images, setImages] = useState([]); // store File objects
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Auto-fetch shop_id from logged-in user
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

  // ✅ Store File objects (max 4)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4); // limit to 4
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (images.length === 0) {
      setMessage('❌ Please upload at least 1 image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('shop_id', form.shop_id);
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('location', form.location);
      formData.append('status', form.status);

      // Append images
      images.forEach((file) => {
        formData.append('images', file);
      });

      const res = await axios.post(`${API_URL}/api/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 201 || res.data.status === 'success') {
        setMessage('✅ Product added successfully!');
        setForm({
          shop_id: form.shop_id,
          name: '',
          price: '',
          location: '',
          status: 'available',
        });
        setImages([]);
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

        <label>Product Images (up to 4)</label>
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
