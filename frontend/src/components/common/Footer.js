import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>© 2025 Trading Journal App</p>
        </div>
        
        <div className="footer-center">
          <p>
            Built with <i className="fas fa-heart"></i> using React, FastAPI, and MCP
          </p>
        </div>
        
        <div className="footer-right">
          <a href="#" className="footer-link">Terms</a>
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
