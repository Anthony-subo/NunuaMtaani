import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { BsCartFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import "../styles/auth.css";

function ResendVerification() {
  const location = useLocation();
  
  // Pre-fill email if passed from Login state
  const [email, setEmail] = useState(location.state?.email || "");
  const [msg, setMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();
    setMsg("");
    setErrMsg("");

    if (!email) {
      setErrMsg("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/resend-verification`,
        { email }
      );

      if (response.data.status === "success") {
        setMsg(response.data.message || "Verification email sent! Check your inbox.");
      }
    } catch (err) {
      console.error(err);
      const errorResponse =
        err.response?.data?.message || "Failed to send verification email. Please try again.";
      setErrMsg(errorResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Brand */}
      <div className="d-flex align-items-center logo mb-3">
        <BsCartFill className="shopping-icon" size={28} />
        <div className="d-flex flex-column">
          <div className="d-flex align-items-center mb-1">
            <h3 className="brand mb-0 me-2">
              <span className="nunua">Nunua</span>
              <span className="m">M</span>
              <span className="taani">taani</span>
            </h3>
            <Link to="/" className="home-icon-link ms-2" title="Home">
              <AiFillHome size={22} className="text-dark" />
            </Link>
          </div>
          <small className="slogan">Your trusted online market</small>
        </div>
      </div>

      <h3 className="text-center mb-3">Resend Verification Email</h3>

      {msg && <div className="alert alert-success">{msg}</div>}
      {errMsg && <div className="alert alert-danger">{errMsg}</div>}

      <form onSubmit={handleResend}>
        <div className="mb-3">
          <label>Email Address</label>
          <input
            type="email"
            className="form-control mt-1"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Sending..." : "Send Verification Link"}
        </button>

        <p className="mt-3 text-center">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default ResendVerification;