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

    if (API_URL) {
      fetch(`${API_URL}/api/products`)
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) => console.log("Products error:", err));
    }
  }, []);

  // 🔧 Robust image lookup supporting Base64, full URLs, and backend uploads safely
  const getProductImage = (item) => {
    const rawImage = item.image || (item.images && item.images.length > 0 ? item.images[0] : null);

    if (!rawImage) {
      const targetId = item._id || item.product_id;
      const product = products.find((p) => p._id === targetId);
      if (product?.images && product.images.length > 0) {
        const prodImg = product.images[0];
        if (prodImg.startsWith("data:image") || prodImg.startsWith("http")) return prodImg;
        return `${API_URL}/uploads/${prodImg}`;
      }
      return "https://via.placeholder.com/400x300?text=No+Image";
    }

    if (rawImage.startsWith("data:image") || rawImage.startsWith("http")) {
      return rawImage;
    }

    return `${API_URL}/uploads/${rawImage}`;
  };

  const handleRemoveItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    if (userId) {
      try {
        localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
      } catch (e) {
        console.error("Storage error:", e);
      }
    }
  };

  const handleQuantityChange = (index, delta) => {
    const updatedCart = [...cart];
    const newQty = (updatedCart[index].quantity || 1) + delta;
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    updatedCart[index].quantity = newQty;
    setCart(updatedCart);
    if (userId) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
    }
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  };

  const groupByShop = (items) => {
    const grouped = {};
    items.forEach((item) => {
      const shopId = item.shop_id || item.sellerShop;
      if (!grouped[shopId]) grouped[shopId] = [];
      grouped[shopId].push(item);
    });
    return grouped;
  };

  // Poll status for created orders until payment is confirmed
  const pollOrderStatus = (createdOrders) => {
    let attempts = 0;
    const maxAttempts = 15; // Poll for ~30 seconds

    const interval = setInterval(async () => {
      attempts++;
      try {
        const statuses = await Promise.all(
          createdOrders.map((order) => axios.get(`${API_URL}/api/orders/${order._id}/status`))
        );

        const allPaid = statuses.every((res) => res.data.status === "paid");
        const anyFailed = statuses.some((res) => res.data.status === "failed");

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

    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.slice(1);
    }

    if (!/^254(7|1)\d{8}$/.test(formattedPhone)) {
      return alert("Please enter a valid M-Pesa phone number (e.g. 0712345678 or 0112345678).");
    }

    setLoading(true);
    setOrderStatus("⏳ Saving your order to database...");

    try {
      const groupedItems = groupByShop(cart);
      const createdOrders = [];

      for (const [shopId, items] of Object.entries(groupedItems)) {
        const total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

        const orderPayload = {
          user_id: userId,
          sellerShop: shopId,
          items: items.map((item) => ({
            product_id: item._id || item.product_id,
            quantity: item.quantity || 1,
            price: item.price,
            name: item.name,
            image: item.image && !item.image.startsWith("data:image") ? item.image : undefined
          })),
          total,
          payment: { method: "mpesa", payerPhone: formattedPhone, status: "pending" },
          status: "pending"
        };

        const orderRes = await axios.post(`${API_URL}/api/orders`, orderPayload);
        createdOrders.push(orderRes.data);
      }

      setOrderStatus("📲 Order saved! Sending M-Pesa prompt to your phone...");

      for (const createdOrder of createdOrders) {
        await axios.post(`${API_URL}/api/payments/stk/initiate`, {
          orderId: createdOrder._id,
          buyerPhone: formattedPhone,
        });
      }

      setOrderStatus("📲 STK push sent! Please enter your M-Pesa PIN...");
      pollOrderStatus(createdOrders);

    } catch (err) {
      console.error("Order placement error:", err);
      setOrderStatus("❌ Failed to process order or payment.");
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
                <img src={getProductImage(item)} alt={item.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                <div style={{ padding: "20px" }}>
                  <h4>{item.name}</h4>
                  <p><strong>Price:</strong> {item.price} KES</p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0" }}>
                    <span><strong>Quantity:</strong></span>
                    <button onClick={() => handleQuantityChange(idx, -1)} style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>-</button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => handleQuantityChange(idx, 1)} style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>+</button>
                  </div>

                  <p style={{ fontWeight: "bold", color: "#0d6efd" }}>Subtotal: {item.price * (item.quantity || 1)} KES</p>
                  <button onClick={() => handleRemoveItem(idx)} style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "#dc3545", color: "white", border: "none", cursor: "pointer", marginTop: "10px" }}>
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
              {loading ? "Processing..." : "✅ Place Order & Pay via M-Pesa"}
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