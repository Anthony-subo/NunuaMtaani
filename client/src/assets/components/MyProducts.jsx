import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function MyProducts() {
  const [myProducts, setMyProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [formValues, setFormValues] = useState({ name: "", price: "", status: "" });

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch seller's products
  useEffect(() => {
    if (!user?._id) return;

    axios
      .get(`${API_URL}/api/products/seller/products/${user._id}`)
      .then((res) => setMyProducts(res.data))
      .catch((err) => console.error("Error fetching your products:", err));
  }, [user]);

  // Delete product
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(`${API_URL}/api/products/${id}`)
        .then(() => {
          setMyProducts((prev) => prev.filter((p) => p._id !== id));
        })
        .catch((err) => console.error("Error deleting product:", err));
    }
  };

  // Open edit modal
  const handleEditClick = (product) => {
    setEditProduct(product);
    setFormValues({
      name: product.name,
      price: product.price,
      status: product.status,
    });
  };

  // Submit edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`${API_URL}/api/products/${editProduct._id}`, formValues)
      .then((res) => {
        const updated = res.data.product; // ✅ use product key
        setMyProducts((prev) =>
          prev.map((p) => (p._id === updated._id ? updated : p))
        );
        setEditProduct(null);
      })
      .catch((err) => console.error("Error updating product:", err));
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
                <img
                  src={`${API_URL}/api/products/${product._id}/image/0`}
                  className="card-img-top"
                  alt={product.name}
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => (e.target.src = "/placeholder.png")}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text mb-1">
                    <strong>Price:</strong> KES {product.price}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Status:</strong>{" "}
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
                      onClick={() => handleEditClick(product)}
                      data-bs-toggle="modal"
                      data-bs-target="#editModal"
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

      {/* ================== EDIT MODAL ================== */}
      <div
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <form onSubmit={handleEditSubmit} className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Product</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                onClick={() => setEditProduct(null)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formValues.name}
                  onChange={(e) =>
                    setFormValues({ ...formValues, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Price (KES)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formValues.price}
                  onChange={(e) =>
                    setFormValues({ ...formValues, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formValues.status}
                  onChange={(e) =>
                    setFormValues({ ...formValues, status: e.target.value })
                  }
                >
                  <option value="available">Available</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MyProducts;
