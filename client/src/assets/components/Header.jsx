import React, { useEffect, useState } from "react"; 
import { Link } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";     
import { FiLogOut } from "react-icons/fi";       
import { BsCartFill } from "react-icons/bs";     
import '../styles/header.css';  

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
      <div className="container">

        {/* LEFT → User Info */}
        <div className="user-info">
          {userName ? (
            <>
              <h6 className="mb-0 fw-semibold">
                Welcome, {userName} <span className="role">({role})</span>
              </h6>
              {shopName && (
                <small className="shop">Shop: {shopName}</small>
              )}
              {email && (
                <small className="email">Logged in as: {email}</small>
              )}
            </>
          ) : (
            <h6 className="mb-0">Welcome, Guest</h6>
          )}

          <nav className="mt-2">
            <Link to="/login" className="logout-btn" title="Logout">
              <FiLogOut size={18} />
            </Link>
          </nav>
        </div>

        {/* RIGHT → Brand + Logo */}
        <div className="d-flex align-items-center logo">
          <BsCartFill className="shopping-icon" size={28} />
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center mb-1">
              <h3 className="brand mb-0 me-2">
                <span className="nunua">Nunua</span>
                <span className="m">M</span>
                <span className="taani">taani</span>
              </h3>
              <Link to="/home" className="home-icon-link ms-2" title="Home">
                <AiFillHome size={22} className="text-dark" />
              </Link>
            </div>
            <small className="slogan">Your trusted online market</small>
          </div>
        </div>
        
      </div>
    </header>
  );
};

export default Header;
