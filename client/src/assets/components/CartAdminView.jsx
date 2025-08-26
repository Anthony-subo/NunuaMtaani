import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CartAdminView() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('/api/orders') // Adjust if using a different route
      .then((res) => setOrders(res.data))
      .catch((err) => console.error('Error loading orders:', err));
  }, []);

  return (
    <div className="admin-table-container">
      <h4>🛒 All Orders (Cart View)</h4>
      <table className="table table-dark table-striped">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Buyer</th>
            <th>Total Items</th>
            <th>Status</th>
            <th>Ordered On</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.buyer?.name || 'N/A'}</td>
              <td>{order.products?.length}</td>
              <td>{order.status}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CartAdminView;
