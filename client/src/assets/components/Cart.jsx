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

  // 🔧 FIXED: Robust image lookup supporting multiple ID keys and direct properties
  const getProductImage = (item) => {
    // 1. Check if the cart item itself already stores an image path
    if (item.image) {
      return item.image.startsWith("http") ? item.image : `${API_URL}/uploads/${item.image}`;
    }
    if (item.images && item.images.length > 0) {
      return item.images[0].startsWith("http") ? item.images[0] : `${API_URL}/uploads/${item.images[0]}`;
    }

    // 2. Otherwise, find the product from the fetched products list using _id or product_id
    const targetId = item._id || item.product_id;
    const product = products.find((p) => p._id === targetId);

    if (product?.images && product.images.length > 0) {
      const imgPath = product.images[0];
      return imgPath.startsWith("http") ? imgPath : `${API_URL}/uploads/${imgPath}`;
    }

    // 3. Fallback placeholder if nothing is found
    return "https://via.placeholder.com/400x300?text=No+Image";
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
      const shopId = item.shop_id || item.sellerShop;
      if (!grouped[shopId]) grouped[shopId] = [];
      grouped[shopId].push(item);
    });
    return grouped;
  };

  // Poll status for the created orders until payment is confirmed
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

    // Standardize phone number format for Daraja API (07... or 01... -> 254...)
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.slice(1);
    }

    // Validate 254 format length
    if (!/^254(7|1)\d{8}$/.test(formattedPhone)) {
      return alert("Please enter a valid M-Pesa phone number (e.g. 0712345678 or 0112345678).");
    }

    setLoading(true);
    setOrderStatus("⏳ Saving your order to database...");

    try {
      const groupedItems = groupByShop(cart);
      const createdOrders = [];

      // STEP 1: Save data to MongoDB FIRST before triggering payment
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
            image: item.image || (item.images ? item.images[0] : undefined)
          })),
          total,
          payment: { method: "mpesa", payerPhone: formattedPhone, status: "pending" },
          status: "pending"
        };

        const orderRes = await axios.post(`${API_URL}/api/orders`, orderPayload);
        createdOrders.push(orderRes.data); // Contains the MongoDB _id
      }

      setOrderStatus("📲 Order saved! Sending M-Pesa prompt to your phone...");

      // STEP 2: Trigger the payment STK push for each saved order
      for (const createdOrder of createdOrders) {
        await axios.post(`${API_URL}/api/payments/stk/initiate`, {
          orderId: createdOrder._id,
          buyerPhone: formattedPhone,
        });
      }

      setOrderStatus("📲 STK push sent! Please enter your M-Pesa PIN...");
      
      // STEP 3: Start checking if the payment was successful
      pollOrderStatus(createdOrders);

    } catch (err) {
      console.error(err);
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