import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Cart() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState("");

  // ✅ Load user + cart + products
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser._id) {
      setUserId(storedUser._id);

      const userCart =
        JSON.parse(localStorage.getItem(`cart_${storedUser._id}`)) || [];

      setCart(userCart);
    }

    // ✅ fetch products (for images)
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.log("Products error:", err));
  }, []);

  // ✅ get image from products (NO localStorage image)
  const getProductImage = (item) => {
    const product = products.find((p) => p._id === item._id);

    return product?.images?.[0]
      ? `${API_URL}/uploads/${product.images[0]}`
      : "https://via.placeholder.com/400x300?text=No+Image";
  };

  const saveCartToStorage = (updatedCart) => {
    if (userId) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
    }
  };

  const handleRemoveItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);

    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  const getTotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
  };

  const groupByShop = (items) => {
    const grouped = {};

    items.forEach((item) => {
      const shopId = item.shop_id;

      if (!grouped[shopId]) grouped[shopId] = [];

      grouped[shopId].push(item);
    });

    return grouped;
  };

  const handlePlaceOrder = async () => {
    if (!userId) {
      alert("Please log in first.");
      return;
    }

    if (!phone) {
      alert("Enter M-Pesa number.");
      return;
    }

    const groupedItems = groupByShop(cart);

    const orderRequests = Object.entries(groupedItems).map(
      async ([shopId, items]) => {
        const orderData = {
          user_id: userId,
          shop_id: shopId,
          items: items.map((item) => ({
            product_id: item._id,
            quantity: item.quantity || 1,
            price: item.price,
            name: item.name,
          })),
          total: items.reduce(
            (sum, item) => sum + item.price * (item.quantity || 1),
            0
          ),
          payment: {
            method: "mpesa",
            payerPhone: phone,
          },
        };

        return axios.post(`${API_URL}/api/orders`, orderData);
      }
    );

    try {
      await Promise.all(orderRequests);

      setOrderStatus(
        "✅ Orders placed successfully. Check your phone for payment."
      );

      localStorage.removeItem(`cart_${userId}`);
      setCart([]);
    } catch (err) {
      console.error(err);
      setOrderStatus("❌ Failed to place order.");
    }
  };

  return (
    <>
      <style>
        {`
          .cart-page {
            min-height: 100vh;
            background: #f5f7fb;
            padding: 40px 20px;
          }

          .cart-title {
            font-size: 34px;
            font-weight: bold;
            margin-bottom: 30px;
            color: #111827;
          }

          .cart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 25px;
          }

          .cart-card {
            background: white;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 4px 18px rgba(0,0,0,0.08);
            transition: 0.3s;
          }

          .cart-card:hover {
            transform: translateY(-6px);
          }

          .cart-image {
            width: 100%;
            height: 240px;
            object-fit: cover;
          }

          .cart-content {
            padding: 20px;
          }

          .cart-content h4 {
            margin-bottom: 15px;
            font-size: 24px;
            color: #111;
          }

          .cart-content p {
            margin-bottom: 10px;
            color: #555;
            font-size: 15px;
          }

          .subtotal {
            font-weight: bold;
            color: #0d6efd;
          }

          .remove-btn {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 10px;
            background: #dc3545;
            color: white;
            font-weight: bold;
            cursor: pointer;
            margin-top: 15px;
          }

          .remove-btn:hover {
            background: #bb2d3b;
          }

          .summary-box {
            margin-top: 40px;
            background: white;
            padding: 25px;
            border-radius: 18px;
            box-shadow: 0 4px 18px rgba(0,0,0,0.08);
          }

          .phone-input {
            width: 100%;
            padding: 14px;
            border-radius: 10px;
            border: 1px solid #ccc;
            margin-bottom: 20px;
          }

          .checkout-btn {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 10px;
            background: #198754;
            color: white;
            font-weight: bold;
            cursor: pointer;
          }

          .checkout-btn:hover {
            background: #157347;
          }

          .order-status {
            margin-top: 20px;
            padding: 15px;
            border-radius: 10px;
            background: #eef6ff;
            color: #0d6efd;
          }

          .empty-cart {
            background: white;
            padding: 40px;
            border-radius: 18px;
            text-align: center;
          }
        `}
      </style>

      <div className="cart-page">
        <h2 className="cart-title">🛒 My Cart</h2>

        {cart.length === 0 ? (
          <div className="empty-cart">Your cart is empty</div>
        ) : (
          <>
            <div className="cart-grid">
              {cart.map((item, idx) => (
                <div className="cart-card" key={idx}>
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    className="cart-image"
                  />

                  <div className="cart-content">
                    <h4>{item.name}</h4>

                    <p>
                      <strong>Price:</strong> {item.price} KES
                    </p>

                    <p>
                      <strong>Quantity:</strong> {item.quantity || 1}
                    </p>

                    <p className="subtotal">
                      Subtotal: {item.price * (item.quantity || 1)} KES
                    </p>

                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(idx)}
                    >
                      🗑 Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-box">
              <h3>Total: {getTotal()} KES</h3>

              <input
                type="text"
                placeholder="Enter you M-Pesa Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="phone-input"
              />

              <button
                className="checkout-btn"
                onClick={handlePlaceOrder}
              >
                ✅ Place Order & Pay
              </button>

              {orderStatus && (
                <div className="order-status.">{orderStatus}</div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Cart;