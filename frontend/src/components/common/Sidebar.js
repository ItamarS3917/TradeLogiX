import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const sidebarItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'fas fa-chart-line',
      requiresAuth: true
    },
    {
      path: '/planning',
      label: 'Planning',
      icon: 'fas fa-clipboard-list',
      requiresAuth: true
    },
    {
      path: '/journal',
      label: 'Trade Journal',
      icon: 'fas fa-book',
      requiresAuth: true
    },
    {
      path: '/statistics',
      label: 'Statistics',
      icon: 'fas fa-chart-bar',
      requiresAuth: true
    },
    {
      path: '/tradesage',
      label: 'TradeSage AI',
      icon: 'fas fa-robot',
      requiresAuth: true
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: 'fas fa-cog',
      requiresAuth: true
    },
    {
      path: '/',
      label: 'Home',
      icon: 'fas fa-home',
      requiresAuth: false
    }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h2>Trading Journal</h2>
        </div>
        
        <ul className="sidebar-menu">
          {sidebarItems.map((item) => {
            // Skip items that require authentication if user is not authenticated
            if (item.requiresAuth && !isAuthenticated) {
              return null;
            }
            
            return (
              <li 
                key={item.path} 
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <Link to={item.path} className="sidebar-link">
                  <i className={item.icon}></i>
                  <span className="sidebar-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="sidebar-footer">
        <div className="sidebar-footer-content">
          <p>© 2025 Trading Journal</p>
          <p>Version 0.1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
