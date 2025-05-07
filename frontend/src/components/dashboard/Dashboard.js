// File: frontend/src/components/dashboard/Dashboard.js
// Purpose: Main dashboard component displaying key trading metrics and widgets

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import MCP client
import { useMcpClient } from '../../services/mcp_client';

// Import API services
import { getPerformanceMetrics, getRecentTrades } from '../../services/trade_service';
import { getDailyPlan } from '../../services/plan_service';

// Import components
import PerformanceSummary from './PerformanceSummary';
import RecentTrades from './RecentTrades';
import TradingStreak from './TradingStreak';
import GoalTracker from './GoalTracker';
import { Loading, Alert } from '../common';

const Dashboard = () => {
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);
  const [todaysPlan, setTodaysPlan] = useState(null);
  
  // MCP client hooks
  const { mcpClient, mcpConnected } = useMcpClient();
  
  // Navigation
  const navigate = useNavigate();
  
  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch performance metrics
        const performanceData = await getPerformanceMetrics();
        setMetrics(performanceData);
        
        // Fetch recent trades
        const trades = await getRecentTrades(5); // Get 5 most recent trades
        setRecentTrades(trades);
        
        // Fetch today's plan
        const today = new Date().toISOString().split('T')[0];
        const plan = await getDailyPlan(today);
        setTodaysPlan(plan);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Handle plan creation if no plan exists for today
  const handleCreatePlan = () => {
    navigate('/planning');
  };
  
  // MCP-powered dashboard customization (to be implemented)
  const customizeDashboard = () => {
    // TODO: Implement MCP-powered dashboard customization
  };
  
  if (loading) return <Loading message="Loading dashboard..." />;
  
  if (error) return <Alert type="error" message={error} />;
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Trading Dashboard</h1>
        <div className="dashboard-actions">
          {!todaysPlan && (
            <button 
              className="btn btn-primary" 
              onClick={handleCreatePlan}
            >
              Create Today's Plan
            </button>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={customizeDashboard}
          >
            Customize Dashboard
          </button>
        </div>
      </div>
      
      <div className="dashboard-grid">
        {/* Performance Summary Widget */}
        <div className="dashboard-widget">
          <PerformanceSummary metrics={metrics} />
        </div>
        
        {/* Recent Trades Widget */}
        <div className="dashboard-widget">
          <RecentTrades trades={recentTrades} />
        </div>
        
        {/* Trading Streak Widget */}
        <div className="dashboard-widget">
          <TradingStreak streakData={metrics?.streakData} />
        </div>
        
        {/* Goal Tracker Widget */}
        <div className="dashboard-widget">
          <GoalTracker goals={metrics?.goals} />
        </div>
      </div>
      
      {/* TODO: Add MCP-powered widget for market context */}
      {/* TODO: Add MCP-powered widget for AI insights */}
      {/* TODO: Add customizable widget layout */}
      {/* TODO: Implement real-time updates with MCP */}
    </div>
  );
};

export default Dashboard;