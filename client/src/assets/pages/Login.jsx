import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BsCartFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
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

        {/* Brand (NunuaMtaani styled like Login with Home icon) */}
            <div className="container d-flex align-items-center logo mb-3">
              <BsCartFill className="shopping-icon" size={28} />
              <div className="d-flex flex-column">
                <div className="d-flex align-items-center mb-1">
                  <h3 className="brand mb-0 me-2">
                    <span className="nunua">Nunua</span>
                    <span className="m">M</span>
                    <span className="taani">taani</span>
                  </h3>
                  <Link to="/hh" className="home-icon-link ms-2" title="Home">
                    <AiFillHome size={22} className="text-dark" />
                  </Link>
                </div>
                <small className="slogan">Your trusted online market</small>
              </div>
            </div>

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
