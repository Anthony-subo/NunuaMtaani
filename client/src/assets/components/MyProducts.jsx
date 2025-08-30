import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function MyProducts() {
  const [myProducts, setMyProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user?._id) return;

    axios
      .get(`${API_URL}/api/products/seller/products/${user._id}`)
      .then((res) => setMyProducts(res.data))
      .catch((err) => console.error('Error fetching your products:', err));
  }, [user]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      axios
        .delete(`${API_URL}/api/products/${id}`)
        .then(() => {
          setMyProducts((prev) => prev.filter((p) => p._id !== id));
        })
        .catch((err) => console.error('Error deleting product:', err));
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`${API_URL}/api/products/${editProduct._id}`, {
        name: editProduct.name,
        price: editProduct.price,
        status: editProduct.status,
      })
      .then((res) => {
        setMyProducts((prev) =>
          prev.map((p) => (p._id === res.data._id ? res.data : p))
        );
        setEditProduct(null);
      })
      .catch((err) => console.error('Error updating product:', err));
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">🧺 My Products</h2>

      <div className="row">
        {myProducts.length === 0 ? (
          <p className="text-muted text-center">No products found.</p>
        ) : (
          myProducts.map((product) => (
            <div className="col-md-4 mb-4" key={product._id}>
              <div className="card h-100 shadow-sm">
                {product.images?.[0] && (
                  <img
                    src={`${API_URL}/uploads/${product.images[0]}`}
                    className="card-img-top"
                    alt={product.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text mb-1">
                    <strong>Price:</strong> KES {product.price}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Status:</strong>{' '}
                    <span className="badge bg-secondary">{product.status}</span>
                  </p>
                  {product.shop_id?.shop_name && (
                    <p className="card-text mb-2">
                      <strong>Shop:</strong> {product.shop_id.shop_name}
                    </p>
                  )}
                  <div className="mt-auto d-flex gap-2">
                    <button
                      className="btn btn-outline-warning w-50"
                      onClick={() => setEditProduct(product)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-outline-danger w-50"
                      onClick={() => handleDelete(product._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editProduct && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Product</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditProduct(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      className="form-control"
                      type="text"
                      value={editProduct.name}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Price (KES)</label>
                    <input
                      className="form-control"
                      type="number"
                      value={editProduct.price}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={editProduct.status}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, status: e.target.value })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setEditProduct(null)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" type="submit">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProducts;
