// File: frontend/src/components/statistics/StatisticsPage.js
// Purpose: Main statistics page component for displaying comprehensive trading analytics

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import MCP client
import { useMcpClient } from '../../services/mcp_client';

// Import API services
import { 
  getStatistics, 
  getWinRateBySetup,
  getProfitabilityByTime,
  getEmotionalAnalysis,
  generateStatisticalInsights
} from '../../services/statistics_service';

// Import child components
import WinRateChart from './WinRateChart';
import ProfitabilityByTime from './ProfitabilityByTime';
import SetupPerformance from './SetupPerformance';
import EmotionalAnalysis from './EmotionalAnalysis';
import { Loading, Alert } from '../common';

const StatisticsPage = () => {
  // State for statistics data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overallStats, setOverallStats] = useState(null);
  const [setupStats, setSetupStats] = useState([]);
  const [timeStats, setTimeStats] = useState([]);
  const [emotionalStats, setEmotionalStats] = useState(null);
  const [insights, setInsights] = useState(null);
  
  // Filter state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [symbol, setSymbol] = useState('NQ'); // Default symbol
  const [setupType, setSetupType] = useState(''); // All setup types
  
  // MCP client hooks
  const { mcpClient, mcpConnected } = useMcpClient();
  
  // Navigation
  const navigate = useNavigate();
  
  // Fetch statistics data when filters change
  useEffect(() => {
    const fetchStatisticsData = async () => {
      try {
        setLoading(true);
        
        // Prepare query parameters
        const params = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          symbol: symbol || undefined,
          setupType: setupType || undefined
        };
        
        // Fetch overall statistics
        const statsData = await getStatistics(params);
        setOverallStats(statsData);
        
        // Fetch win rate by setup data
        const setupData = await getWinRateBySetup(params);
        setSetupStats(setupData);
        
        // Fetch profitability by time data
        const timeData = await getProfitabilityByTime(params);
        setTimeStats(timeData);
        
        // Fetch emotional analysis data
        const emotionalData = await getEmotionalAnalysis(params);
        setEmotionalStats(emotionalData);
        
        // Generate AI insights if MCP is available
        if (mcpConnected) {
          const insightsData = await generateStatisticalInsights(params);
          setInsights(insightsData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching statistics data:', err);
        setError('Failed to load statistics data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchStatisticsData();
  }, [dateRange, symbol, setupType, mcpConnected]);
  
  // Handle filter changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSymbolChange = (e) => {
    setSymbol(e.target.value);
  };
  
  const handleSetupTypeChange = (e) => {
    setSetupType(e.target.value);
  };
  
  // Handle export
  const handleExportData = async (format) => {
    // TODO: Implement export functionality
    alert(`Exporting data as ${format}... (Not implemented yet)`);
  };
  
  if (loading) return <Loading message="Loading statistics..." />;
  
  if (error) return <Alert type="error" message={error} />;
  
  return (
    <div className="statistics-page">
      <div className="statistics-header mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold dark:text-white">Trading Statistics</h1>
          <div className="export-buttons flex gap-2">
            <button 
              className="btn btn-secondary text-sm" 
              onClick={() => handleExportData('csv')}
            >
              Export CSV
            </button>
            <button 
              className="btn btn-secondary text-sm" 
              onClick={() => handleExportData('pdf')}
            >
              Export PDF
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="statistics-filters bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="filter-group">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div className="filter-group">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div className="filter-group">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Symbol
            </label>
            <select
              value={symbol}
              onChange={handleSymbolChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Symbols</option>
              <option value="NQ">NQ Futures</option>
              <option value="ES">ES Futures</option>
              <option value="CL">CL Futures</option>
              {/* Add more symbols as needed */}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Setup Type
            </label>
            <select
              value={setupType}
              onChange={handleSetupTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Setups</option>
              <option value="MMXM_STANDARD">MMXM Standard</option>
              <option value="MMXM_AGGRESSIVE">MMXM Aggressive</option>
              <option value="ICT_BPR">ICT BPR</option>
              <option value="ICT_OTE">ICT OTE</option>
              <option value="ICT_LONDON_OPEN">ICT London Open</option>
              {/* Add more setup types as needed */}
            </select>
          </div>
        </div>
      </div>
      
      {/* Statistics Summary */}
      <div className="statistics-summary mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Win Rate</div>
          <div className="text-2xl font-bold dark:text-white">{overallStats?.winRate}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {overallStats?.totalTrades} total trades
          </div>
        </div>
        
        <div className="stat-card bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit Factor</div>
          <div className="text-2xl font-bold dark:text-white">{overallStats?.profitFactor.toFixed(2)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Gross profit / gross loss
          </div>
        </div>
        
        <div className="stat-card bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Average R:R</div>
          <div className="text-2xl font-bold dark:text-white">{overallStats?.averageRiskReward.toFixed(2)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Risk/reward ratio
          </div>
        </div>
        
        <div className="stat-card bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit</div>
          <div className={`text-2xl font-bold ${overallStats?.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {overallStats?.netProfit >= 0 ? '+' : ''}${overallStats?.netProfit.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            During selected period
          </div>
        </div>
      </div>
      
      {/* Main Statistics Grid */}
      <div className="statistics-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Win Rate by Setup Chart */}
        <div className="statistics-widget bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Win Rate by Setup</h2>
          <WinRateChart data={setupStats} />
        </div>
        
        {/* Profitability by Time Chart */}
        <div className="statistics-widget bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Profitability by Time</h2>
          <ProfitabilityByTime data={timeStats} />
        </div>
        
        {/* Setup Performance Details */}
        <div className="statistics-widget bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Setup Performance Details</h2>
          <SetupPerformance data={setupStats} />
        </div>
        
        {/* Emotional Analysis */}
        <div className="statistics-widget bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Emotional Impact Analysis</h2>
          <EmotionalAnalysis data={emotionalStats} />
        </div>
      </div>
      
      {/* AI-Powered Insights (Only if MCP is connected) */}
      {mcpConnected && insights && (
        <div className="statistics-insights mt-6 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">TradeSage Insights</h2>
          <div className="insights-content p-4 bg-gray-50 rounded-lg dark:bg-gray-700 dark:text-white">
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Key Findings</h3>
              <ul className="list-disc pl-5 space-y-1">
                {insights.keyFindings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Improvement Suggestions</h3>
              <ul className="list-disc pl-5 space-y-1">
                {insights.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Recommended Focus Areas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {insights.focusAreas.map((area, index) => (
                  <div 
                    key={index}
                    className="focus-area p-2 bg-white rounded border border-gray-200 dark:bg-gray-800 dark:border-gray-600"
                  >
                    <div className="font-medium">{area.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{area.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
