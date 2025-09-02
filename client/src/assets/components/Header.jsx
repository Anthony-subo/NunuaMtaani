import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { BsCartFill } from "react-icons/bs";
import "../styles/layout.css";

const Header = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setShopName(user.shopName || "");
    }
  }, []);

  return (
    <header className="nm-header">
      <div className="nm-header-container">

        {/* Left - Brand */}
        <div className="nm-brand">
          <BsCartFill className="shopping-icon" size={30} />
          <div>
            <h3 className="nm-title">
              <span className="nunua">Nunua</span>
              <span className="m">M</span>
              <span className="taani">taani</span>
              <Link to="/home" className="home-icon-link" title="Home">
                <AiFillHome size={22} />
              </Link>
            </h3>
            <small className="slogan">Your trusted online market</small>
          </div>
        </div>

        {/* Right - User Info */}
        <div className="nm-user-info">
          {userName ? (
            <>
              <p className="welcome-text">
                Welcome, {userName} <span className="role">({role})</span>
              </p>
              {shopName && <small className="shop-name">Shop: {shopName}</small>}
              {email && <small className="email">Logged in as: {email}</small>}
            </>
          ) : (
            <p className="welcome-text">Welcome, Guest</p>
          )}

          <Link to="/login" className="logout-btn" title="Logout">
            <FiLogOut size={18} />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
