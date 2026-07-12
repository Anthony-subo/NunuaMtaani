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
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password checks
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
      const result = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          location: location.trim(),
          password,
        }
      );

      if (result.data.status === "success") {
        navigate("/login", {
          state: {
            message:
              result.data.message ||
              "Registration successful! Please check your email to verify your account.",
          },
        });
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

            <Link to="/" className="home-icon-link ms-2" title="Home">
              <AiFillHome size={22} className="text-dark" />
            </Link>
          </div>

          <small className="slogan">
            Your trusted online market
          </small>
        </div>
      </div>

      <h3 className="text-center mb-4">
        Create Account
      </h3>

      {errMsg && (
        <div className="alert alert-danger">
          {errMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name */}

        <label>Full Name</label>

        <input
          type="text"
          className="form-control"
          placeholder="John Doe"
          value={name}
          disabled={loading}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <br />

        {/* Email */}

        <label>Email Address</label>

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

        <br />

        {/* Phone */}

        <label>Phone Number</label>

        <input
          type="tel"
          className="form-control"
          placeholder="07XXXXXXXX"
          autoComplete="tel"
          pattern="^(07|01)[0-9]{8}$"
          title="Enter a valid Kenyan phone number"
          value={phone}
          disabled={loading}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <br />

        {/* Location */}

        <label>Location</label>

        <input
          type="text"
          className="form-control"
          placeholder="Nairobi, Kenya"
          value={location}
          disabled={loading}
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

        {/* Password Strength */}

        <div className="mt-3">
          <small className={checks.length ? "text-success" : "text-danger"}>
            {checks.length ? "✔" : "✖"} Minimum 8 characters
          </small>

          <br />

          <small className={checks.upper ? "text-success" : "text-danger"}>
            {checks.upper ? "✔" : "✖"} One uppercase letter
          </small>

          <br />

          <small className={checks.lower ? "text-success" : "text-danger"}>
            {checks.lower ? "✔" : "✖"} One lowercase letter
          </small>

          <br />

          <small className={checks.number ? "text-success" : "text-danger"}>
            {checks.number ? "✔" : "✖"} One number
          </small>

          <br />

          <small className={checks.special ? "text-success" : "text-danger"}>
            {checks.special ? "✔" : "✖"} One special character (@$!%*?&.#)
          </small>
        </div>

        <br />

        {/* Confirm Password */}

        <label>Confirm Password</label>

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
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <br />

        <button
          type="submit"
          className="btn btn-primary w-100"
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
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;