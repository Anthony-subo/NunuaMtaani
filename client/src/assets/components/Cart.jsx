import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Cart() {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState(""); // ✅ payment phone

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser._id) {
      setUserId(storedUser._id);
      const userCart =
        JSON.parse(localStorage.getItem(`cart_${storedUser._id}`)) || [];
      setCart(userCart);
    }
  }, []);

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
      alert("Please log in to place an order.");
      return;
    }
    if (!phone) {
      alert("Please enter your M-Pesa phone number.");
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
            name: item.name, // ✅ only keep small text fields
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

        return axios.post(`${API_URL}/api/orders`, orderData, {
          headers: { "Content-Type": "application/json" },
          maxBodyLength: 5 * 1024 * 1024, // 5MB safety
        });
      }
    );

    try {
      await Promise.all(orderRequests);
      setOrderStatus(
        "✅ Orders placed. Please check your phone to complete payment via M-Pesa."
      );
      localStorage.removeItem(`cart_${userId}`);
      setCart([]);
    } catch (err) {
      console.error("Order placement failed:", err.response?.data || err.message);
      setOrderStatus("❌ Failed to place one or more orders. Try again.");
    }
  };

  return (
    <div className="admin-table-container">
      <div className="dashboard-header">
        <h4 className="mb-3">🛒 Your Cart</h4>
      </div>
      <div>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-cards-container">
              {cart.map((item, idx) => (
                <div key={idx} className="cart-card shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">{item.name}</h5>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveItem(idx)}
                    >
                      🗑 Remove
                    </button>
                  </div>
                  <p className="mb-1">
                    <strong>Price:</strong> {item.price} KES
                  </p>
                  <p className="mb-1">
                    <strong>Quantity:</strong> {item.quantity || 1}
                  </p>
                  <p className="mb-1">
                    <strong>Subtotal:</strong>{" "}
                    {item.price * (item.quantity || 1)} KES
                  </p>
                  {item.location && (
                    <p className="mb-1">
                      <strong>Location:</strong> {item.location}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <h5 className="mt-4">Total: {getTotal()} KES</h5>

            {/* ✅ Payment phone input */}
            <div className="mt-3">
              <label>Enter M-Pesa Number:</label>
              <input
                type="text"
                className="form-control"
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button className="btn btn-success mt-3" onClick={handlePlaceOrder}>
              ✅ Place Order & Pay
            </button>
          </>
        )}
        {orderStatus && (
          <div className="alert alert-info mt-3">{orderStatus}</div>
        )}
      </div>
    </div>
  );
}

export default Cart;
