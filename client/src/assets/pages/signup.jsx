import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import axios from 'axios';

function Signup() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrMsg(''); // Clear previous error

    axios.post('http://localhost:3001/api/auth/register', { name, phone, email, location, password })
      .then(result => {
        if (result.data.status === 'success') {
          navigate('/login');
        } else {
          setErrMsg(result.data.message || 'Registration failed');
        }
      })
      .catch(err => {
        console.error(err);
        setErrMsg(err.response?.data?.message || 'Something went wrong');
      });
  };

  return (
    <div className="auth-container">
      <h2>NunuaMtaani</h2>
      <h2>SignUp</h2>

      {errMsg && <div className="alert alert-danger">{errMsg}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          placeholder="Name"
          name="name"
          className="form-control"
          onChange={(e) => setName(e.target.value)}
          required
        /><br />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Enter email"
          name="email"
          className="form-control"
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />

        <label htmlFor="phone">Phone</label>
        <input
          type="tel"
          placeholder="Phone"
          name="phone"
          className="form-control"
          onChange={(e) => setPhone(e.target.value)}
          required
        /><br />

        <label htmlFor="location">Location</label>
        <input
          type="text"
          placeholder="Location"
          name="location"
          className="form-control"
          onChange={(e) => setLocation(e.target.value)}
        /><br />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          name="password"
          className="form-control"
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />

        <button type="submit" className="btn btn-primary">Register</button>

        <p className="mt-3">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
