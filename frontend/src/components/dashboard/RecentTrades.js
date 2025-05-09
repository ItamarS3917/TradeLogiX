// File: frontend/src/components/dashboard/RecentTrades.js
// Purpose: Component displaying the most recent trades

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '../../utils/formatters';

const RecentTrades = ({ trades = [] }) => {
  // Helper function to determine status color based on trade outcome
  const getStatusColor = (outcome) => {
    switch (outcome?.toLowerCase()) {
      case 'win':
        return 'bg-green-100 text-green-800';
      case 'loss':
        return 'bg-red-100 text-red-800';
      case 'breakeven':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to format profit/loss with appropriate color
  const formatProfitLoss = (pl) => {
    if (!pl && pl !== 0) return '-';
    
    const formattedValue = `${pl >= 0 ? '+' : ''}$${Math.abs(pl).toFixed(2)}`;
    const colorClass = pl > 0 ? 'text-green-600' : pl < 0 ? 'text-red-600' : 'text-gray-600';
    
    return <span className={colorClass}>{formattedValue}</span>;
  };

  // Helper function to format setup type label
  const formatSetupType = (setupType) => {
    if (!setupType) return '-';
    
    // Return just the setup type, capitalized
    return setupType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // If no trades, display message
  if (!trades.length) {
    return (
      <div className="recent-trades p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Trades</h2>
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          No trades recorded yet
        </div>
        <div className="text-center">
          <Link to="/trades/new" className="btn btn-primary inline-block">
            Record Your First Trade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-trades p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Recent Trades</h2>
        <Link to="/journal" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
          View All →
        </Link>
      </div>
      
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Symbol</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Setup</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">P&L</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Outcome</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {trades.map(trade => (
              <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium dark:text-white">
                  <Link to={`/trades/${trade.id}`} className="hover:underline">
                    {trade.symbol}
                  </Link>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {formatSetupType(trade.setup_type)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(trade.entry_time)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {formatProfitLoss(trade.profit_loss)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(trade.outcome)}`}>
                    {trade.outcome || 'Unknown'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-center">
        <Link to="/trades/new" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
          + Add New Trade
        </Link>
      </div>
    </div>
  );
};

export default RecentTrades;
