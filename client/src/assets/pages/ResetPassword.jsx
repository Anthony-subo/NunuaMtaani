import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BsCartFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import "../styles/auth.css";

function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
        {
          password,
        }
      );

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Password reset failed."
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
        Reset Password
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
        <label>New Password</label>

        <input
          type="password"
          className="form-control"
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <br />

        <label>Confirm Password</label>

        <input
          type="password"
          className="form-control"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          required
        />

        <br />

        <button
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading
            ? "Updating..."
            : "Update Password"}
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

export default ResetPassword;