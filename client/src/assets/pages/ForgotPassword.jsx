import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BsCartFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import "../styles/auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        { email }
      );

      setMessage(res.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send reset email."
      );
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="d-flex align-items-center logo mb-3">
        <BsCartFill className="shopping-icon" size={28} />

        <div className="d-flex flex-column">
          <div className="d-flex align-items-center mb-1">
            <h3 className="brand mb-0 me-2">
              <span className="nunua">Nunua</span>
              <span className="m">M</span>
              <span className="taani">taani</span>
            </h3>

            <Link to="/" className="home-icon-link ms-2">
              <AiFillHome size={22} />
            </Link>
          </div>

          <small className="slogan">
            Your trusted online market
          </small>
        </div>
      </div>

      <h3 className="text-center mb-3">
        Forgot Password
      </h3>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Email Address</label>

        <input
          type="email"
          className="form-control"
          placeholder="Enter your email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <br />

        <button
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
        </button>
      </form>

      <p className="text-center mt-3">
        <Link to="/login">
          Back to Login
        </Link>
      </p>
    </div>
  );
}

export default ForgotPassword;