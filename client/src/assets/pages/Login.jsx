import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BsCartFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrMsg("");
    setLoading(true);

    try {
      const result = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      if (result.data.status === "success") {
        // Save token
        localStorage.setItem("token", result.data.token);

        // Save user
        localStorage.setItem(
          "user",
          JSON.stringify(result.data.user)
        );

        // Redirect by role
        switch (result.data.user.role) {
          case "admin":
            navigate("/admin-dashboard");
            break;

          case "seller":
            navigate("/seller-dashboard");
            break;

          case "buyer":
            navigate("/buyer-dashboard");
            break;

          case "rider":
            navigate("/rider-dashboard");
            break;

          default:
            navigate("/home");
        }
      }
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message || "Login failed.";

      setErrMsg(message);
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

            <Link
              to="/"
              className="home-icon-link ms-2"
              title="Home"
            >
              <AiFillHome
                size={22}
                className="text-dark"
              />
            </Link>

          </div>

          <small className="slogan">
            Your trusted online market
          </small>

        </div>
      </div>

      <h3 className="text-center mb-3">
        Welcome Back
      </h3>

      {errMsg && (
        <div className="alert alert-danger">
          {errMsg}

          {errMsg.includes("verify your email") && (
            <div className="mt-2">
              <Link
                to="/resend-verification"
                className="btn btn-sm btn-outline-primary"
              >
                Resend Verification Email
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <label>Email</label>

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

        <label>Password</label>

        <input
          type="password"
          className="form-control"
          placeholder="Enter your password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <br />

        <button
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center mt-3">

          <Link to="/forgot-password">
            Forgot Password?
          </Link>

        </div>

        <p className="mt-3 text-center">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>

      </form>

    </div>
  );
}

export default Login;