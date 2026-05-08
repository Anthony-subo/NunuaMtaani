import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Cart() {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] =
    useState(false);

  // LOAD USER + CART
  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (storedUser && storedUser._id) {
      setUserId(storedUser._id);

      const userCart =
        JSON.parse(
          localStorage.getItem(
            `cart_${storedUser._id}`
          )
        ) || [];

      setCart(userCart);
    }
  }, []);

  // SAVE CART
  const saveCartToStorage = (
    updatedCart
  ) => {
    if (userId) {
      localStorage.setItem(
        `cart_${userId}`,
        JSON.stringify(updatedCart)
      );
    }
  };

  // REMOVE ITEM
  const handleRemoveItem = (
    index
  ) => {
    const updatedCart = [...cart];

    updatedCart.splice(index, 1);

    setCart(updatedCart);

    saveCartToStorage(
      updatedCart
    );
  };

  // UPDATE QUANTITY
  const updateQuantity = (
    index,
    type
  ) => {
    const updatedCart = [...cart];

    if (type === "increase") {
      updatedCart[index].quantity =
        (updatedCart[index]
          .quantity || 1) + 1;
    }

    if (type === "decrease") {
      if (
        (updatedCart[index]
          .quantity || 1) > 1
      ) {
        updatedCart[index]
          .quantity -= 1;
      }
    }

    setCart(updatedCart);

    saveCartToStorage(
      updatedCart
    );
  };

  // TOTAL
  const getTotal = () => {
    return cart.reduce(
      (sum, item) =>
        sum +
        item.price *
          (item.quantity || 1),
      0
    );
  };

  // GROUP PRODUCTS BY SHOP
  const groupByShop = (
    items
  ) => {
    const grouped = {};

    items.forEach((item) => {
      const shopId =
        item.shop_id;

      if (!grouped[shopId]) {
        grouped[shopId] = [];
      }

      grouped[shopId].push(
        item
      );
    });

    return grouped;
  };

  // CHECK PAYMENT STATUS
  const startPaymentCheck = (
    orderIds
  ) => {
    setCheckingPayment(true);

    const interval = setInterval(
      async () => {
        try {
          const responses =
            await Promise.all(
              orderIds.map(
                (id) =>
                  axios.get(
                    `${API_URL}/api/orders/${id}`
                  )
              )
            );

          const allPaid =
            responses.every(
              (res) =>
                res.data.payment
                  ?.status ===
                "paid"
            );

          if (allPaid) {
            clearInterval(
              interval
            );

            localStorage.removeItem(
              `cart_${userId}`
            );

            setCart([]);

            setOrderStatus(
              "✅ Payment successful! Order placed."
            );

            setCheckingPayment(
              false
            );
          }
        } catch (err) {
          console.error(
            "Payment check error:",
            err.response
              ?.data ||
              err.message
          );
        }
      },
      5000
    );

    // STOP AFTER 5 MINUTES
    setTimeout(() => {
      clearInterval(interval);

      setCheckingPayment(
        false
      );
    }, 300000);
  };

  // PLACE ORDER
  const handlePlaceOrder =
    async () => {
      if (!userId) {
        alert(
          "Please log in to place an order."
        );

        return;
      }

      if (
        cart.length === 0
      ) {
        alert(
          "Your cart is empty."
        );

        return;
      }

      if (!phone) {
        alert(
          "Please enter your M-Pesa phone number."
        );

        return;
      }

      setLoading(true);

      setOrderStatus("");

      try {
        const groupedItems =
          groupByShop(cart);

        // CREATE ORDERS
        const orderResponses =
          await Promise.all(
            Object.entries(
              groupedItems
            ).map(
              async ([
                shopId,
                items,
              ]) => {
                const orderData =
                  {
                    user_id:
                      userId,

                    shop_id:
                      shopId,

                    items:
                      items.map(
                        (
                          item
                        ) => ({
                          product_id:
                            item._id,

                          quantity:
                            item.quantity ||
                            1,

                          price:
                            item.price,

                          name:
                            item.name,

                          image:
                            item
                              .images?.[0] ||
                            "",

                          location:
                            item.location ||
                            "",
                        })
                      ),

                    total:
                      items.reduce(
                        (
                          sum,
                          item
                        ) =>
                          sum +
                          item.price *
                            (item.quantity ||
                              1),
                        0
                      ),

                    status:
                      "pending",

                    payment:
                      {
                        method:
                          "mpesa",

                        payerPhone:
                          phone,
                      },
                  };

                console.log(
                  "ORDER DATA:",
                  orderData
                );

                return axios.post(
                  `${API_URL}/api/orders`,
                  orderData,
                  {
                    headers:
                      {
                        "Content-Type":
                          "application/json",
                      },

                    maxBodyLength:
                      5 *
                      1024 *
                      1024,
                  }
                );
              }
            )
          );

        // GET ORDER IDS
        const createdOrderIds =
          orderResponses.map(
            (res) =>
              res.data._id
          );

        // INITIATE STK PUSH
        await Promise.all(
          createdOrderIds.map(
            (
              orderId
            ) =>
              axios.post(
                `${API_URL}/api/payments/stk/initiate`,
                {
                  orderId,

                  buyerPhone:
                    phone,
                }
              )
          )
        );

        setOrderStatus(
          "📲 STK Push sent. Complete payment on your phone..."
        );

        // START PAYMENT CHECK
        startPaymentCheck(
          createdOrderIds
        );
      } catch (err) {
        console.error(
          "ORDER ERROR:",
          err.response
            ?.data ||
            err.message
        );

        setOrderStatus(
          "❌ Failed to place the order. Try again."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="admin-table-container">
      <div className="dashboard-header">
        <h4 className="mb-3">
          🛒 Your Cart
        </h4>
      </div>

      <div>
        {cart.length === 0 ? (
          <p>
            Your cart is empty.
          </p>
        ) : (
          <>
            <div className="cart-cards-container">
              {cart.map(
                (
                  item,
                  idx
                ) => (
                  <div
                    key={idx}
                    className="cart-card shadow-sm"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="mb-0">
                        {
                          item.name
                        }
                      </h5>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          handleRemoveItem(
                            idx
                          )
                        }
                      >
                        🗑 Remove
                      </button>
                    </div>

                    <p className="mb-1">
                      <strong>
                        Price:
                      </strong>{" "}
                      {
                        item.price
                      }{" "}
                      KES
                    </p>

                    <div className="d-flex align-items-center gap-2 mb-2">
                      <strong>
                        Quantity:
                      </strong>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          updateQuantity(
                            idx,
                            "decrease"
                          )
                        }
                      >
                        -
                      </button>

                      <span>
                        {item.quantity ||
                          1}
                      </span>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          updateQuantity(
                            idx,
                            "increase"
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <p className="mb-1">
                      <strong>
                        Subtotal:
                      </strong>{" "}
                      {item.price *
                        (item.quantity ||
                          1)}{" "}
                      KES
                    </p>

                    {item.location && (
                      <p className="mb-1">
                        <strong>
                          Location:
                        </strong>{" "}
                        {
                          item.location
                        }
                      </p>
                    )}
                  </div>
                )
              )}
            </div>

            <h5 className="mt-4">
              Total:{" "}
              {getTotal()} KES
            </h5>

            {/* PAYMENT PHONE */}
            <div className="mt-3">
              <label>
                Enter M-Pesa
                Number:
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
              />
            </div>

            <button
              className="btn btn-success mt-3"
              onClick={
                handlePlaceOrder
              }
              disabled={
                loading ||
                checkingPayment
              }
            >
              {loading
                ? "Processing..."
                : checkingPayment
                ? "Waiting for payment..."
                : "✅ Place Order & Pay"}
            </button>
          </>
        )}

        {orderStatus && (
          <div className="alert alert-info mt-3">
            {orderStatus}
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;