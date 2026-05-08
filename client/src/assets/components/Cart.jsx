import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Cart() {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser._id) {
      setUserId(storedUser._id);

      const userCart =
        JSON.parse(localStorage.getItem(`cart_${storedUser._id}`)) || [];

      setCart(userCart);
    }
  }, []);

  // REMOVE ITEM
  const handleRemoveItem = (index) => {
    const updatedCart = [...cart];

    updatedCart.splice(index, 1);

    setCart(updatedCart);

    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
  };

  // UPDATE QUANTITY
  const updateQuantity = (index, type) => {
    const updatedCart = [...cart];

    if (type === "increase") {
      updatedCart[index].quantity =
        (updatedCart[index].quantity || 1) + 1;
    }

    if (type === "decrease") {
      if ((updatedCart[index].quantity || 1) > 1) {
        updatedCart[index].quantity -= 1;
      }
    }

    setCart(updatedCart);

    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
  };

  // TOTAL
  const getTotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
  };

  // GROUP PRODUCTS BY SHOP
  const groupByShop = (items) => {
    const grouped = {};

    items.forEach((item) => {
      if (!grouped[item.shop_id]) {
        grouped[item.shop_id] = [];
      }

      grouped[item.shop_id].push(item);
    });

    return grouped;
  };

  // PLACE ORDER
  const handlePlaceOrder = async () => {
    if (!userId) {
      return alert("Please login first.");
    }

    if (cart.length === 0) {
      return alert("Cart is empty.");
    }

    if (!phone) {
      return alert("Enter phone number.");
    }

    setLoading(true);
    setOrderStatus("");

    try {
      const groupedItems = groupByShop(cart);

      await Promise.all(
        Object.entries(groupedItems).map(([shopId, items]) =>
          axios.post(`${API_URL}/api/orders`, {
            user_id: userId,

            shop_id: shopId,

            items: items.map((item) => ({
              product_id: item._id || item.id,

              quantity: item.quantity || 1,

              price: item.price,

              name: item.name,

              image: item.images?.[0] || "",

              location: item.location || "",
            })),

            total: items.reduce(
              (sum, item) =>
                sum + item.price * (item.quantity || 1),
              0
            ),

            status: "pending",

            payment: {
              method: "mpesa",

              payerPhone: phone,
            },
          })
        )
      );

      // CLEAR CART
      localStorage.removeItem(`cart_${userId}`);

      setCart([]);

      setOrderStatus("✅ Order placed successfully.");

    } catch (err) {
      console.error("ORDER ERROR:", err);

      setOrderStatus("❌ Failed to place order.");
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
            <div
              key={idx}
              className="cart-card shadow-sm p-3 mb-3"
            >
              <div className="d-flex gap-3 align-items-center">

                <img
                  src={
                    item.images?.[0] ||
                    "https://via.placeholder.com/100"
                  }
                  alt={item.name}
                  width="100"
                  height="100"
                  style={{
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />

                <div className="flex-grow-1">
                  <h5>{item.name}</h5>

                  <p className="mb-1">
                    Price: <strong>{item.price} KES</strong>
                  </p>

                  <p className="mb-2">
                    Subtotal:
                    <strong>
                      {" "}
                      {item.price * (item.quantity || 1)} KES
                    </strong>
                  </p>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        updateQuantity(idx, "decrease")
                      }
                    >
                      -
                    </button>

                    <span>{item.quantity || 1}</span>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        updateQuantity(idx, "increase")
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveItem(idx)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <h5>Total: {getTotal()} KES</h5>

            <input
              type="text"
              className="form-control mt-3"
              placeholder="07XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button
              className="btn btn-success mt-3 w-100"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
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