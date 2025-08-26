import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductImageSlider from '../components/ProductImageSlider';
import '../styles/allproduct.css';

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Failed to fetch products:', err));

    axios.get('http://localhost:3001/api/shops')
      .then(res => setShops(res.data))
      .catch(err => console.error('Failed to fetch shops:', err));

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser._id) {
      setUserId(storedUser._id);
    }
  }, []);

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

    cart.push({ ...product, quantity: 1 });
    localStorage.setItem(cartKey, JSON.stringify(cart));
    alert(`${product.name} added to cart.`);
  };

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
          {products.map(p => (
            <div key={p._id} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm product-card">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <span className="shop-name">{getShopName(p.shop_id)}</span>
                  <span className="verified-check">✅</span>
                </div>

                <ProductImageSlider images={p.images} />

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
          ))}
        </div>
      )}
    </div>
  );
}

export default AllProducts;
