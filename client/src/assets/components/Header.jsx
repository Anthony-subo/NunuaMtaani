import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";     // Home icon
import { FiLogOut } from "react-icons/fi";       // Logout icon
import { BsCartFill } from "react-icons/bs";     // Shopping cart icon
import '../styles/layout.css';

const Header = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setShopName(user.shopName || '');
    }
  }, []);

  return (
    <header className="nm-header">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">

        {/* Brand with shopping cart and home icon */}
        <div className="d-flex align-items-center logo flex-wrap">
          <BsCartFill className="shopping-icon" size={26} />

          <div className="d-flex flex-column flex-sm-row align-items-sm-center ms-2">
            <div className="d-flex align-items-center mb-1">
              <h3 className="mb-0 me-2 d-flex align-items-center">
                <span className="nunua">Nunua</span>
                <span className="m">M</span>
                <span className="taani">taani</span>
              </h3>

              {/* Home icon beside NunuaMtaani */}
              <Link to="/home" className="home-icon-link ms-2" title="Home">
                <AiFillHome size={22} className="text-dark" />
              </Link>
            </div>

            <small className="text-muted slogan ms-sm-2 mt-1 mt-sm-0">Your trusted online market</small>
          </div>
        </div>

        {/* User Info + Logout */}
        <div className="text-end text-sm-start mt-3 mt-md-0">
          {userName ? (
            <>
              <h6 className="mb-0 fw-semibold text-dark">
                Welcome, {userName} <span className="text-info">({role})</span>
              </h6>
              {shopName && (
                <small className="text-warning d-block">Shop: {shopName}</small>
              )}
              {email && (
                <small className="text-dark d-block">Logged in as: {email}</small>
              )}
              
            </>
          ) : (
            <h6 className="mb-0">Welcome, Guest</h6>
          )}

          <nav className="mt-2">
            <Link to="/login" className="btn btn-outline-warning btn-sm" title="Logout">
              <FiLogOut size={18} />
            </Link>
          </nav>
        </div>

      </div>
    </header>
  );
};

export default Header;
