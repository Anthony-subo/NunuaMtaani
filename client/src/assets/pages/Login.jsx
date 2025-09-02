import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BrandHeader from '../components/BrandHeader';
import '../styles/auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrMsg('');
    axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password })
      .then(result => {
        if (result.data.status === "success") {
          localStorage.setItem("user", JSON.stringify(result.data.user));
          navigate('/home');
        } else {
          setErrMsg(result.data.message || 'Login failed');
        }
      })
      .catch(err => {
        console.error(err.response?.data || err.message);
        setErrMsg(err.response?.data?.message || 'Login failed');
      });
  };

  return (
    <div className="auth-container">
      <BrandHeader />

      <h3 className="text-center mb-3">Login</h3>

      {errMsg && <div className="alert alert-danger">{errMsg}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Enter email"
          name="email"
          className="form-control"
          onChange={(e) => setEmail(e.target.value)}
          required
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

        <button type="submit" className="btn btn-primary w-100">Login</button>

        <p className="mt-3 text-center">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
