import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/admin-tables.css';


function AllUsers() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [showShopForm, setShowShopForm] = useState(false);
  const [shopFormData, setShopFormData] = useState({
    user_id: '',
    shop_name: '',
    owner_name: '',
    email: '',
    location: '',
  });

  useEffect(() => {
    axios.get('http://localhost:3001/api/users')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      axios.delete(`http://localhost:3001/api/users/${id}`)
        .then(() => setUsers(prev => prev.filter(u => u._id !== id)))
        .catch(err => console.error('Delete error:', err));
    }
  };

  const handleRoleChange = (id, newRole) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === id ? { ...user, role: newRole } : user
      )
    );
  };

  const handleRoleUpdate = (id, role) => {
    axios.patch(`http://localhost:3001/api/users/${id}`, { role })
      .then(() => alert('Role updated successfully'))
      .catch(err => {
        console.error('Error updating role:', err);
        alert('Error updating role');
      });
  };

  const handleCreateShopClick = (user) => {
    setShopFormData({
      user_id: user._id,
      shop_name: '',
      owner_name: user.name,
      email: user.email,
      location: user.location,
    });
    setShowShopForm(true);
  };

  const handleShopInputChange = (e) => {
    const { name, value } = e.target;
    setShopFormData({ ...shopFormData, [name]: value.trimStart() });
  };

  const handleShopSubmit = () => {
    const { shop_name, owner_name, email, location } = shopFormData;

    if (!shop_name || !owner_name || !email || !location) {
      return alert('All fields are required.');
    }

    axios.post('http://localhost:3001/api/shops', shopFormData)
      .then(() => {
        alert('✅ Shop created successfully!');
        setShowShopForm(false);
      })
      .catch(err => {
        console.error('Shop creation error:', err);
        alert('❌ Failed to create shop');
      });
  };

  const filteredUsers =
    roleFilter === 'all' ? users : users.filter((user) => user.role === roleFilter);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowShopForm(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="admin-table-container">
      <h4>All Registered Users ({filteredUsers.length})</h4>
        <div style={{ overflowX: 'auto' }}>
      <div className="mb-3">
        <label>Filter by Role:</label>{' '}
        <select onChange={(e) => setRoleFilter(e.target.value)} value={roleFilter}>
          <option value="all">All</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
          <option value="rider">Rider</option>
        </select>
      </div>

     {filteredUsers.length === 0 ? (
  <p className="text-muted">No users found.</p>
) : (
  <div className="user-cards-container">
    {filteredUsers.map((user) => (
      <div key={user._id} className="user-card shadow-sm">
        <h5>{user.name}</h5>
        <p className="mb-1"><strong>Email:</strong> {user.email}</p>
        <p className="mb-1"><strong>Role:</strong> {user.role}</p>
        <p className="mb-1"><strong>Location:</strong> {user.location}</p>

        <div className="mb-2">
          <label><strong>Change Role:</strong></label>
          <select
            value={user.role}
            onChange={(e) => handleRoleChange(user._id, e.target.value)}
            className="form-select form-select-sm"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
            <option value="rider">Rider</option>
          </select>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-success btn-sm" onClick={() => handleRoleUpdate(user._id, user.role)}>
            Update
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user._id)}>
            Delete
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => handleCreateShopClick(user)}>
            Create Shop
          </button>
        </div>
      </div>
    ))}
  </div>
)}


      {/* Modal */}
      {showShopForm && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title">Create Shop for User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowShopForm(false)}
                />
              </div>
              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  name="shop_name"
                  value={shopFormData.shop_name}
                  onChange={handleShopInputChange}
                  placeholder="Shop Name"
                />
                <input
                  className="form-control mb-2"
                  name="owner_name"
                  value={shopFormData.owner_name}
                  onChange={handleShopInputChange}
                  placeholder="Owner Name"
                />
                <input
                  className="form-control mb-2"
                  name="email"
                  value={shopFormData.email}
                  onChange={handleShopInputChange}
                  placeholder="Email"
                />
                <input
                  className="form-control mb-2"
                  name="location"
                  value={shopFormData.location}
                  onChange={handleShopInputChange}
                  placeholder="Location"
                />
              </div>
              <div className="modal-footer">
                <button onClick={handleShopSubmit} className="btn btn-primary">Submit</button>
                <button onClick={() => setShowShopForm(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default AllUsers;
