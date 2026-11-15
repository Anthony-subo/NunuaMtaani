import React, { useEffect, useState } from 'react';
import ProductImageSlider from '../components/ProductImageSlider';
import '../styles/allproduct.css';

const API_URL = import.meta.env.VITE_API_URL;

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!API_URL) {
      setErrorMessage('VITE_API_URL is not defined in your environment variables.');
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${API_URL}/api/products`).then(res => {
        if (!res.ok) throw new Error(`Products API error: ${res.status}`);
        return res.json();
      }),
      fetch(`${API_URL}/api/shops`).then(res => {
        if (!res.ok) throw new Error(`Shops API error: ${res.status}`);
        return res.json();
      })
    ])
      .then(([productData, shopData]) => {
        setProducts(productData);
        setShops(shopData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
        setErrorMessage(`Failed to connect to backend: ${err.message}`);
        setLoading(false);
      });

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser._id) {
      setUserId(storedUser._id);
    }
  }, []);

  const formatImage = (img) => {
    if (!img) return null;
    if (img.startsWith('data:image') || img.startsWith('http')) {
      return img;
    }
    return `${API_URL}/uploads/${img}`;
  };

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

    const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;
    const sanitizedImage = formatImage(firstImage);

    const cartItem = {
      _id: product._id,
      shop_id: product.shop_id || product.sellerShop,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: sanitizedImage
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

  const getShopName = (shop_id) => {
    const shop = shops.find(s => String(s._id) === String(shop_id));
    return shop ? shop.shop_name : 'Unknown Shop';
  };

  if (loading) {
    return <div className="container text-center mt-5"><p>Loading products...</p></div>;
  }

  if (errorMessage) {
    return (
      <div className="container text-center mt-5">
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="container all-products-container">
      <h4 className="section-title">🛍️ All Products</h4>

      {products.length === 0 ? (
        <div className="empty-state text-center py-4">
          <p className="text-muted">No products available in the database. Check back soon!</p>
        </div>
      ) : (
        <div className="row">
          {products.map(p => {
            const formattedImages = p.images && p.images.length > 0
              ? p.images.map(img => formatImage(img))
              : ["https://via.placeholder.com/400x300?text=No+Image"];

            return (
              <div key={p._id} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm product-card border-0 bg-transparent">
                  <ProductImageSlider 
                    images={formattedImages} 
                    shopName={getShopName(p.shop_id)} 
                    productName={p.name}
                    price={p.price}
                    status={p.status}
                    onAddToCart={() => addToCart(p)}
                  />
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