import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <Link to="/" className="navbar-logo">
          Trading Journal
        </Link>
      </div>
      
      <div className="navbar-center">
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>
      
      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <div className="navbar-notifications">
              <button className="notification-button">
                <i className="fas fa-bell"></i>
                <span className="notification-badge">3</span>
              </button>
            </div>
            
            <div className="navbar-user">
              <div className="user-avatar">
                <img src={user.avatar || '/default-avatar.jpg'} alt="User" />
              </div>
              <div className="user-dropdown">
                <button className="user-dropdown-toggle">
                  {user.username} <i className="fas fa-caret-down"></i>
                </button>
                <div className="user-dropdown-menu">
                  <Link to="/settings" className="dropdown-item">
                    Settings
                  </Link>
                  <button className="dropdown-item" onClick={logout}>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-button">
              Login
            </Link>
            <Link to="/register" className="register-button">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
