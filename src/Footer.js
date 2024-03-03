import React from 'react';
import logo from './assets/logo.png';
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <img src={logo} alt="NLP&C Logo" className="footer-logo" />
        <p>&copy; 2024 Natural Language Processing & Culture Research Laboratory, University of Florida. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;