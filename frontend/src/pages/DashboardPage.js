import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../services/api';

// Import components
import PerformanceWidget from '../components/dashboard/PerformanceWidget';
import RecentTradesWidget from '../components/dashboard/RecentTradesWidget';
import DailyPlanWidget from '../components/dashboard/DailyPlanWidget';
import WinRateWidget from '../components/dashboard/WinRateWidget';
import AlertsWidget from '../components/dashboard/AlertsWidget';
import GoalsWidget from '../components/dashboard/GoalsWidget';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    performance: null,
    recentTrades: [],
    dailyPlan: null,
    winRate: null,
    alerts: [],
    goals: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch recent trades
        const tradesResponse = await endpoints.trades.getAll({
          user_id: user.id,
          limit: 5,
          sort: 'entry_time:desc'
        });
        
        // Fetch performance statistics
        const statsResponse = await endpoints.trades.getStatistics(
          user.id, 
          { period: '30d' }
        );
        
        // Fetch today's daily plan
        const today = new Date().toISOString().split('T')[0];
        const planResponse = await endpoints.plans.getByDate(today);
        
        // Fetch alerts
        const alertsResponse = await endpoints.alerts.getAll({
          user_id: user.id,
          status: 'ACTIVE',
          limit: 5
        });
        
        // Update dashboard data
        setDashboardData({
          performance: statsResponse.data,
          recentTrades: tradesResponse.data,
          dailyPlan: planResponse.data,
          winRate: statsResponse.data.win_rate,
          alerts: alertsResponse.data,
          goals: planResponse.data?.goals || []
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="dashboard-page">
        <div className="auth-message">
          <h2>Please log in to view your dashboard</h2>
          <p>You need to be logged in to access your trading dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1>Trading Dashboard</h1>
      
      <div className="dashboard-greeting">
        <h2>Welcome back, {user.full_name || user.username}</h2>
        <p>Here's your trading summary for today</p>
      </div>
      
      <div className="dashboard-grid">
        {/* Top row */}
        <div className="dashboard-row">
          <PerformanceWidget data={dashboardData.performance} />
          <WinRateWidget winRate={dashboardData.winRate} />
          <AlertsWidget alerts={dashboardData.alerts} />
        </div>
        
        {/* Bottom row */}
        <div className="dashboard-row">
          <RecentTradesWidget trades={dashboardData.recentTrades} />
          <DailyPlanWidget plan={dashboardData.dailyPlan} />
          <GoalsWidget goals={dashboardData.goals} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
