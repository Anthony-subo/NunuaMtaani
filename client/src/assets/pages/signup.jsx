import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BsCartFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/auth.css";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errMsg, setErrMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Live password validation checks
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&.#]/.test(password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setWarningMsg("");

    if (password !== confirmPassword) {
      setErrMsg("Passwords do not match.");
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setErrMsg(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          location: location.trim(),
          password,
        }
      );

      const { status, message } = response.data;

      if (status === "success") {
        navigate("/login", {
          state: {
            message:
              message ||
              "Registration successful! Please check your email to verify your account.",
          },
        });
      } else if (status === "warning") {
        // Handle account created, but email dispatch failure
        setWarningMsg(
          message ||
            "Account created, but we couldn't send the verification email. You can resend it from the login page."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrMsg(
        err.response?.data?.message ||
          "Registration failed. Please check your network connection and try again."
      );
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

      <h3 className="text-center mb-4">Create Account</h3>

      {/* Alert Messages */}
      {errMsg && <div className="alert alert-danger mb-3">{errMsg}</div>}
      {warningMsg && <div className="alert alert-warning mb-3">{warningMsg}</div>}

      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="John Doe"
            value={name}
            disabled={loading}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email Address */}
        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            placeholder="example@gmail.com"
            autoComplete="email"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Phone Number */}
        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-control"
            placeholder="07XXXXXXXX"
            autoComplete="tel"
            pattern="^(07|01)[0-9]{8}$"
            title="Enter a valid Kenyan phone number (e.g., 0712345678 or 0112345678)"
            value={phone}
            disabled={loading}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {/* Location */}
        <div className="mb-3">
          <label className="form-label">Location</label>
          <input
            type="text"
            className="form-control"
            placeholder="Nairobi, Kenya"
            value={location}
            disabled={loading}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Password Validation Indicators */}
          <div className="mt-2">
            <small className={checks.length ? "text-success d-block" : "text-danger d-block"}>
              {checks.length ? "✔" : "✖"} Minimum 8 characters
            </small>
            <small className={checks.upper ? "text-success d-block" : "text-danger d-block"}>
              {checks.upper ? "✔" : "✖"} One uppercase letter
            </small>
            <small className={checks.lower ? "text-success d-block" : "text-danger d-block"}>
              {checks.lower ? "✔" : "✖"} One lowercase letter
            </small>
            <small className={checks.number ? "text-success d-block" : "text-danger d-block"}>
              {checks.number ? "✔" : "✖"} One number
            </small>
            <small className={checks.special ? "text-success d-block" : "text-danger d-block"}>
              {checks.special ? "✔" : "✖"} One special character (@$!%*?&.#)
            </small>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="form-label">Confirm Password</label>
          <div className="input-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control"
              placeholder="Confirm Password"
              autoComplete="new-password"
              value={confirmPassword}
              disabled={loading}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary w-100 py-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Creating Account...
            </>
          ) : (
            "Register"
          )}
        </button>

        <p className="mt-4 text-center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;