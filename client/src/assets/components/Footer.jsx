import React from "react";
import { Link } from "react-router-dom";
import '../styles/layout.css';

const Footer = () => {
  return (
    <footer className="nm-footer">
      <div className="container text-center">
        <h5 className="fw-bold mb-2">NunuaMtaani</h5>
        <p className="text-muted mb-3 small">Your trusted online market</p>

        <div className="mb-3">
          <Link to="/about" className="text-white mx-2 text-decoration-none">About Us</Link>
          <Link to="/contact" className="text-white mx-2 text-decoration-none">Contact</Link>
          <Link to="/terms" className="text-white mx-2 text-decoration-none">Terms</Link>
        </div>

        <div className="mb-3">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white mx-2 text-decoration-none">
            <i className="bi bi-facebook"></i> Facebook
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white mx-2 text-decoration-none">
            <i className="bi bi-twitter"></i> Twitter
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white mx-2 text-decoration-none">
            <i className="bi bi-instagram"></i> Instagram
          </a>
        </div>

        <p className="mb-0 small text-muted">© 2025 NunuaMtaani. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
