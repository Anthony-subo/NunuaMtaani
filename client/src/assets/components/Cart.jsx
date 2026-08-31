import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Cart() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser._id) {
      setUserId(storedUser._id);
      const userCart = JSON.parse(localStorage.getItem(`cart_${storedUser._id}`)) || [];
      setCart(userCart);
    }

    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.log("Products error:", err));
  }, []);

  const getProductImage = (item) => {
    const product = products.find((p) => p._id === item._id);
    return product?.images?.[0]
      ? `${API_URL}/uploads/${product.images[0]}`
      : "https://via.placeholder.com/400x300?text=No+Image";
  };

  const handleRemoveItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    if (userId) localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
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

  const pollOrderStatus = (createdOrders) => {
    let attempts = 0;
    const maxAttempts = 15; // Poll for ~30 seconds

    const interval = setInterval(async () => {
      attempts++;
      try {
        const statuses = await Promise.all(
          createdOrders.map(order => axios.get(`${API_URL}/api/orders/${order._id}/status`))
        );

        const allPaid = statuses.every(res => res.data.status === 'paid');
        const anyFailed = statuses.some(res => res.data.status === 'failed');

        if (allPaid) {
          clearInterval(interval);
          setOrderStatus("🎉 Payment received! Your order is confirmed.");
          localStorage.removeItem(`cart_${userId}`);
          setCart([]);
          setLoading(false);
        } else if (anyFailed) {
          clearInterval(interval);
          setOrderStatus("❌ Payment failed or cancelled on phone. Please try again.");
          setLoading(false);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setOrderStatus("⏱️ Payment confirmation timeout. Please check your order history.");
          setLoading(false);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 2000);
  };

  const handlePlaceOrder = async () => {
    if (!userId) return alert("Please log in first.");
    if (!phone) return alert("Please enter your M-Pesa phone number.");

    setLoading(true);
    setOrderStatus("⏳ Creating order(s) and sending M-Pesa prompt...");

    try {
      const groupedItems = groupByShop(cart);
      const createdOrders = [];

      for (const [shopId, items] of Object.entries(groupedItems)) {
        const total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
        
        const orderPayload = {
          user_id: userId,
          sellerShop: shopId,
          items: items.map((item) => ({
            product_id: item._id,
            quantity: item.quantity || 1,
            price: item.price,
            name: item.name,
          })),
          total,
          payment: { method: "mpesa", payerPhone: phone },
        };

        const orderRes = await axios.post(`${API_URL}/api/orders`, orderPayload);
        const createdOrder = orderRes.data;
        createdOrders.push(createdOrder);

        await axios.post(`${API_URL}/api/payments/stk/initiate`, {
          orderId: createdOrder._id,
          buyerPhone: phone,
        });
      }

      setOrderStatus("📲 STK push sent! Please enter your M-Pesa PIN on your phone...");
      pollOrderStatus(createdOrders);
    } catch (err) {
      console.error(err);
      setOrderStatus("❌ Failed to initiate payment.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fb", padding: "40px 20px" }}>
      <h2 style={{ fontSize: "34px", fontWeight: "bold", marginBottom: "30px" }}>🛒 My Cart</h2>

      {cart.length === 0 ? (
        <div style={{ background: "white", padding: "40px", borderRadius: "18px", textAlign: "center" }}>
          Your cart is empty
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ background: "white", borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 18px rgba(0,0,0,0.08)" }}>
                <img src={getProductImage(item)} alt={item.name} style={{ width: "100%", height: "240px", objectFit: "cover" }} />
                <div style={{ padding: "20px" }}>
                  <h4>{item.name}</h4>
                  <p><strong>Price:</strong> {item.price} KES</p>
                  <p><strong>Quantity:</strong> {item.quantity || 1}</p>
                  <p style={{ fontWeight: "bold", color: "#0d6efd" }}>Subtotal: {item.price * (item.quantity || 1)} KES</p>
                  <button onClick={() => handleRemoveItem(idx)} style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "#dc3545", color: "white", border: "none", cursor: "pointer", marginTop: "15px" }}>
                    🗑 Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "40px", background: "white", padding: "25px", borderRadius: "18px", boxShadow: "0 4px 18px rgba(0,0,0,0.08)" }}>
            <h3>Total: {getTotal()} KES</h3>

            <input
              type="text"
              placeholder="Enter M-Pesa Phone (e.g. 0712345678)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #ccc", marginBottom: "20px" }}
            />

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              style={{ width: "100%", padding: "14px", border: "none", borderRadius: "10px", background: loading ? "#6c757d" : "#198754", color: "white", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Processing Payment..." : "✅ Place Order & Pay via M-Pesa"}
            </button>

            {orderStatus && (
              <div style={{ marginTop: "20px", padding: "15px", borderRadius: "10px", background: "#eef6ff", color: "#0d6efd", fontWeight: "500" }}>
                {orderStatus}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;