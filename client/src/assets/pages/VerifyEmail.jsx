import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  BsCartFill,
  BsCheckCircleFill,
  BsXCircleFill,
} from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import "../styles/auth.css";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/verify-email/${token}`
        );

        setSuccess(true);
        setMessage(
          res.data.message ||
            "Your email has been verified successfully."
        );

        setTimeout(() => {
          navigate("/login");
        }, 4000);
      } catch (err) {
        console.error(err);

        setSuccess(false);

        setMessage(
          err.response?.data?.message ||
            "Verification link is invalid or has expired."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

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
            >
              <AiFillHome size={22} />
            </Link>

          </div>

          <small className="slogan">
            Your trusted online market
          </small>

        </div>

      </div>

      <h3 className="text-center mb-4">
        Email Verification
      </h3>

      {loading ? (
        <div className="text-center">

          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="mt-3">
            Verifying your email...
          </p>

        </div>
      ) : success ? (
        <div className="text-center">

          <BsCheckCircleFill
            size={70}
            className="text-success mb-3"
          />

          <h4 className="text-success">
            Email Verified!
          </h4>

          <p>{message}</p>

          <div className="alert alert-success">
            You can now login to your account.
            <br />
            Redirecting in a few seconds...
          </div>

          <Link
            to="/login"
            className="btn btn-success w-100"
          >
            Login Now
          </Link>

        </div>
      ) : (
        <div className="text-center">

          <BsXCircleFill
            size={70}
            className="text-danger mb-3"
          />

          <h4 className="text-danger">
            Verification Failed
          </h4>

          <p>{message}</p>

          <div className="alert alert-danger">
            The verification link may have expired.
          </div>

          <Link
            to="/login"
            className="btn btn-primary w-100"
          >
            Back to Login
          </Link>

        </div>
      )}
    </div>
  );
}

export default VerifyEmail;