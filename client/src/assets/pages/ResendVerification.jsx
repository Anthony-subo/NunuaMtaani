import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { BsCartFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import "../styles/auth.css";

function ResendVerification() {
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [msg, setMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (errMsg) setErrMsg("");
    if (msg) setMsg("");
  };

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

      if (response.data.status === "success" || response.status === 200) {
        setMsg(response.data.message || "Verification email sent! Check your inbox.");
        setCooldown(60); // 60-second cooldown
      }
    } catch (err) {
      console.error(err);
      const rawError = err.response?.data?.message;
      const errorResponse =
        typeof rawError === "string"
          ? rawError
          : "Failed to send verification email. Please try again.";
      setErrMsg(errorResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Brand Header */}
      <div className="d-flex align-items-center logo mb-3">
        <BsCartFill className="shopping-icon" size={28} />
        <div className="d-flex flex-column ms-2">
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

      {msg && <div className="alert alert-success" role="alert">{msg}</div>}
      {errMsg && <div className="alert alert-danger" role="alert">{errMsg}</div>}

      <form onSubmit={handleResend}>
        <div className="mb-3">
          <label htmlFor="emailInput" className="form-label">
            Email Address
          </label>
          <input
            id="emailInput"
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={handleInputChange}
            disabled={loading || cooldown > 0}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2"
          disabled={loading || cooldown > 0}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sending...
            </>
          ) : cooldown > 0 ? (
            `Resend available in ${cooldown}s`
          ) : (
            "Send Verification Link"
          )}
        </button>

        <p className="mt-4 text-center">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default ResendVerification;