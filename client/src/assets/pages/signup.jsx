import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BsCartFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/auth.css";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          name,
          phone,
          email,
          location,
          password,
        }
      );

      if (result.data.status === "success") {
        setSuccessMsg(result.data.message);

        setName("");
        setPhone("");
        setEmail("");
        setLocation("");
        setPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          navigate("/login");
        }, 4000);
      }
    } catch (err) {
      console.error(err);

      setErrMsg(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">

      {/* Logo */}

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
              <AiFillHome size={22} className="text-dark" />
            </Link>

          </div>

          <small className="slogan">
            Your trusted online market
          </small>

        </div>

      </div>

      <h3 className="text-center mb-3">
        Create Account
      </h3>

      {errMsg && (
        <div className="alert alert-danger">
          {errMsg}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          {successMsg}
          <br />
          <strong>
            Please check your email and verify your account.
          </strong>
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Name */}

        <label>Name</label>

        <input
          type="text"
          className="form-control"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <br />

        {/* Email */}

        <label>Email</label>

        <input
          type="email"
          className="form-control"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br />

        {/* Phone */}

        <label>Phone</label>

        <input
          type="tel"
          className="form-control"
          placeholder="07XXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <br />

        {/* Location */}

        <label>Location</label>

        <input
          type="text"
          className="form-control"
          placeholder="Your Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <br />

        {/* Password */}

        <label>Password</label>

        <div className="input-group">

          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </button>

        </div>

        <small className="text-muted">

          Password must contain:

          <ul className="mt-2">

            <li>Minimum 8 characters</li>

            <li>One uppercase letter</li>

            <li>One lowercase letter</li>

            <li>One number</li>

            <li>One special character (@$!%*?&.#)</li>

          </ul>

        </small>

        <br />

        {/* Confirm Password */}

        <label>Confirm Password</label>

        <div className="input-group">

          <input
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            className="form-control"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
          />

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
          >
            {showConfirmPassword ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </button>

        </div>

        <br />

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading
            ? "Creating Account..."
            : "Register"}
        </button>

        <p className="mt-4 text-center">

          Already have an account?

          <Link to="/login"> Login</Link>

        </p>

      </form>

    </div>
  );
}

export default Signup;