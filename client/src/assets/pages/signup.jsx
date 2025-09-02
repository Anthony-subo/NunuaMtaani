import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BsCartFill } from "react-icons/bs";
import '../styles/auth.css';

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
    setErrMsg('');

    axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { 
      name, phone, email, location, password 
    })
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

      {/* Brand (NunuaMtaani styled like Login) */}
      <div className="d-flex align-items-center justify-content-center logo mb-3">
        <BsCartFill className="shopping-icon me-2" size={32} />
        <div className="d-flex flex-column text-center">
          <h2 className="brand mb-1">
            <span className="nunua">Nunua</span>
            <span className="m">M</span>
            <span className="taani">taani</span>
          </h2>
          <small className="slogan">Your trusted online market</small>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-center mb-3">Sign Up</h3>

      {/* Error Message */}
      {errMsg && <div className="alert alert-danger">{errMsg}</div>}

      {/* Form */}
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

        <button type="submit" className="btn btn-primary w-100">Register</button>

        <p className="mt-3 text-center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
