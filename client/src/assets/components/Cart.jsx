import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://nunuamtaani.onrender.com";

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load cart from localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  // ✅ Calculate total
  const calculateTotal = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ✅ Place Order + Trigger M-Pesa STK
  const handlePlaceOrder = async () => {
    if (!cart.length) {
      alert("Cart is empty");
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user._id || !user.phone) {
        alert("Login first and ensure your phone number is saved.");
        setLoading(false);
        return;
      }

      // 1️⃣ Create the order in backend
      const orderData = {
        user_id: user._id,
        items: cart.map((item) => ({
          product_id: item._id,
          quantity: item.quantity,
        })),
        total: calculateTotal(),
      };

      const orderRes = await axios.post(`${API_URL}/api/orders`, orderData);
      const orderId = orderRes.data._id;

      console.log("Order created:", orderRes.data);

      // 2️⃣ Trigger STK Push
      const formattedPhone = user.phone.startsWith("254")
        ? user.phone
        : "254" + user.phone.replace(/^0/, "");

      const paymentRes = await axios.post(
        `${API_URL}/api/payments/stk/initiate`,
        {
          amount: orderData.total,
          phoneNumber: formattedPhone,
          orderId, // optional (for logs)
        }
      );

      console.log("STK Response:", paymentRes.data);

      if (paymentRes.data.CustomerMessage) {
        alert(paymentRes.data.CustomerMessage);
      } else {
        alert("Payment request sent to your phone.");
      }

      // ✅ Clear cart on success
      localStorage.removeItem("cart");
      setCart([]);
    } catch (error) {
      console.error("Payment Error:", error.response?.data || error.message);
      alert("Something went wrong with payment. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>My Cart</h2>
      {cart.map((item, i) => (
        <div key={i}>
          {item.name} - {item.quantity} x KES {item.price}
        </div>
      ))}
      <h3>Total: KES {calculateTotal()}</h3>
      <button onClick={handlePlaceOrder} disabled={loading}>
        {loading ? "Processing..." : "Place Order & Pay"}
      </button>
    </div>
  );
}

export default Cart;
