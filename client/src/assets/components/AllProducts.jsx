import React, { useEffect, useState } from 'react';
import ProductImageSlider from '../components/ProductImageSlider';
import '../styles/allproduct.css';

const API_URL = import.meta.env.VITE_API_URL;

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Fetch products
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch products:', err));

    // Fetch shops
    fetch(`${API_URL}/api/shops`)
      .then(res => res.json())
      .then(data => setShops(data))
      .catch(err => console.error('Failed to fetch shops:', err));

    // Load logged-in user
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser._id) {
      setUserId(storedUser._id);
    }
  }, []);

  // Helper to format image URLs safely for display & storage
  const formatImage = (img) => {
    if (!img) return null;
    if (img.startsWith('data:image') || img.startsWith('http')) {
      return img;
    }
    return `${API_URL}/uploads/${img}`;
  };

  // ✅ Add to Cart (Cleaned up to prevent QuotaExceededError)
  const addToCart = (product) => {
    if (!userId) {
      alert('Please log in to add to cart.');
      return;
    }

    const cartKey = `cart_${userId}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      alert(`${product.name} is already in the cart.`);
      return;
    }

    // Extract only a lightweight image reference or first formatted image string
    const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;
    const sanitizedImage = formatImage(firstImage);

    // Save lightweight properties to prevent localstorage quota crash
    const cartItem = {
      _id: product._id,
      shop_id: product.shop_id || product.sellerShop,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: sanitizedImage // Store safe single string instead of massive raw arrays
    };

    const newCart = [...cart, cartItem];
    
    try {
      localStorage.setItem(cartKey, JSON.stringify(newCart));
      alert(`${product.name} added to cart.`);
    } catch (e) {
      console.error("Storage quota error:", e);
      alert("Storage limit reached. Clear some cart items.");
    }
  };

  // Find shop name
  const getShopName = (shop_id) => {
    const shop = shops.find(s => String(s._id) === String(shop_id));
    return shop ? shop.shop_name : 'Unknown Shop';
  };

  return (
    <div className="container all-products-container">
      <h4 className="section-title">🛍️ All Products</h4>

      {products.length === 0 ? (
        <div className="empty-state">
          <p className="text-muted">No products available. Check back soon!</p>
        </div>
      ) : (
        <div className="row">
          {products.map(p => {
            // Pre-format product images for the slider so they display cleanly
            const formattedImages = p.images && p.images.length > 0
              ? p.images.map(img => formatImage(img))
              : ["https://via.placeholder.com/400x300?text=No+Image"];

            return (
              <div key={p._id} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm product-card">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <span className="shop-name">{getShopName(p.shop_id)}</span>
                    <span className="verified-check">✅</span>
                  </div>

                  {/* Pass formatted images to your slider */}
                  <ProductImageSlider images={formattedImages} />

                  <div className="card-body">
                    <h5 className="card-title">{p.name}</h5>
                    <p className="card-text">
                      <strong>Price:</strong> {p.price} KES<br />
                      <strong>Status:</strong>{' '}
                      <span className="badge bg-secondary">{p.status}</span>
                    </p>

                    <button
                      className="btn btn-outline-primary w-100 mt-2"
                      onClick={() => addToCart(p)}
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AllProducts;