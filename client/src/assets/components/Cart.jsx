import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Cart() {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false); // 🔥 CHANGE

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser._id) {
      setUserId(storedUser._id);
      const userCart =
        JSON.parse(localStorage.getItem(`cart_${storedUser._id}`)) || [];
      setCart(userCart);
    }
  }, []);

  const handleRemoveItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
  };

  const getTotal = () =>
    cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const groupByShop = (items) => {
    const grouped = {};
    items.forEach((item) => {
      if (!grouped[item.shop_id]) grouped[item.shop_id] = [];
      grouped[item.shop_id].push(item);
    });
    return grouped;
  };

  // 🔥 MAIN FIXED FUNCTION
  const handlePlaceOrder = async () => {
    if (!userId) return alert("Please log in.");
    if (!phone) return alert("Enter M-Pesa number.");

    setLoading(true);
    setOrderStatus("");

    try {
      const groupedItems = groupByShop(cart);

      // 1️⃣ Create orders
      const orderResponses = await Promise.all(
        Object.entries(groupedItems).map(([shopId, items]) =>
          axios.post(`${API_URL}/api/orders`, {
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
            payment: { method: "mpesa" },
          })
        )
      );

      // 2️⃣ Trigger STK for EACH order
      await Promise.all(
        orderResponses.map((res) =>
          axios.post(`${API_URL}/api/payments/stk/initiate`, {
            orderId: res.data._id,
            buyerPhone: phone,
          })
        )
      );

      // 3️⃣ Tell user to pay
      setOrderStatus("📲 Check your phone to complete M-Pesa payment");

      // ❌ DO NOT clear cart yet (wait for payment confirmation)
    } catch (err) {
      console.error(err);
      setOrderStatus("❌ Failed to place order or initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-table-container">
      <h4>🛒 Your Cart</h4>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item, idx) => (
            <div key={idx} className="cart-card shadow-sm">
              <h5>{item.name}</h5>
              <p>Price: {item.price} KES</p>
              <p>Qty: {item.quantity || 1}</p>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleRemoveItem(idx)}
              >
                Remove
              </button>
            </div>
          ))}

          <h5 className="mt-3">Total: {getTotal()} KES</h5>

          <input
            type="text"
            className="form-control mt-2"
            placeholder="07XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            className="btn btn-success mt-3"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Processing..." : "Place Order & Pay"}
          </button>
        </>
      )}

      {orderStatus && (
        <div className="alert alert-info mt-3">{orderStatus}</div>
      )}
    </div>
  );
}

export default Cart;
