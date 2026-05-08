import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Cart() {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser._id) {
      setUserId(storedUser._id);

      const userCart =
        JSON.parse(localStorage.getItem(`cart_${storedUser._id}`)) || [];

      setCart(userCart);
    }
  }, []);

  // SAVE CART
  const saveCart = (updated) => {
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updated));
  };

  // REMOVE ITEM
  const handleRemoveItem = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
    saveCart(updated);
  };

  // TOTAL
  const getTotal = () =>
    cart.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );

  // GROUP BY SHOP
  const groupByShop = (items) => {
    const grouped = {};

    items.forEach((item) => {
      const shopId = item.shop_id;

      if (!grouped[shopId]) {
        grouped[shopId] = [];
      }

      grouped[shopId].push(item);
    });

    return grouped;
  };

  // PLACE ORDER
  const handlePlaceOrder = async () => {
    if (!userId) return setOrderStatus("❌ Please login first");
    if (!phone) return setOrderStatus("❌ Enter M-Pesa number");
    if (cart.length === 0) return setOrderStatus("❌ Cart is empty");

    try {
      const grouped = groupByShop(cart);

      await Promise.all(
        Object.entries(grouped).map(([shopId, items]) => {
          const total = items.reduce(
            (sum, item) =>
              sum + item.price * (item.quantity || 1),
            0
          );

          return axios.post(`${API_URL}/api/orders`, {
            user_id: userId,
            shop_id: shopId,

            items: items.map((item) => ({
              product_id: item._id || item.id,
              quantity: item.quantity || 1,
              price: item.price,
              name: item.name,
              image: item.images?.[0] || "",
            })),

            total,

            status: "pending",

            payment: {
              method: "mpesa",
              payerPhone: phone.startsWith("0")
                ? "254" + phone.substring(1)
                : phone,
              amount: total,
            },
          });
        })
      );

      // CLEAR CART AFTER SUCCESS
      localStorage.removeItem(`cart_${userId}`);
      setCart([]);

      setOrderStatus("✅ Order placed successfully!");

    } catch (err) {
      console.error(err);
      setOrderStatus("❌ Failed to place order");
    }
  };

  return (
    <div className="admin-table-container">
      <h4>🛒 Your Cart</h4>

      {cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <>
          {cart.map((item, idx) => (
            <div key={idx} className="cart-card shadow-sm p-3 mb-3">
              <h5>{item.name}</h5>
              <p>Price: {item.price} KES</p>
              <p>Qty: {item.quantity || 1}</p>
              <p>
                Subtotal: {item.price * (item.quantity || 1)} KES
              </p>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleRemoveItem(idx)}
              >
                Remove
              </button>
            </div>
          ))}

          <h5>Total: {getTotal()} KES</h5>

          <input
            className="form-control mt-3"
            placeholder="Enter M-Pesa number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            className="btn btn-success mt-3 w-100"
            onClick={handlePlaceOrder}
          >
            Place Order
          </button>
        </>
      )}

      {orderStatus && (
        <div className="alert alert-info mt-3">
          {orderStatus}
        </div>
      )}
    </div>
  );
}

export default Cart;