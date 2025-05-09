// File: frontend/src/components/statistics/SetupPerformance.js
// Purpose: Component for displaying detailed setup performance metrics

import React, { useState } from 'react';

const SetupPerformance = ({ data = [] }) => {
  const [sortKey, setSortKey] = useState('winRate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedSetup, setExpandedSetup] = useState(null);
  
  // Handle sorting
  const handleSort = (key) => {
    if (sortKey === key) {
      // Toggle direction if same key
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new key and default to descending
      setSortKey(key);
      setSortDirection('desc');
    }
  };
  
  // Sort the data based on current sort settings
  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;
    
    // Compare based on sort key
    switch (sortKey) {
      case 'setupType':
        comparison = a.setupType.localeCompare(b.setupType);
        break;
      case 'winRate':
        comparison = a.winRate - b.winRate;
        break;
      case 'tradeCount':
        comparison = a.tradeCount - b.tradeCount;
        break;
      case 'profitFactor':
        comparison = a.profitFactor - b.profitFactor;
        break;
      case 'avgProfit':
        comparison = a.averageProfit - b.averageProfit;
        break;
      case 'netProfit':
        comparison = a.netProfit - b.netProfit;
        break;
      default:
        comparison = 0;
    }
    
    // Apply sort direction
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Format setup name for display
  const formatSetupName = (setupType) => {
    if (!setupType) return 'Unknown';
    
    // Remove prefix and convert to title case
    return setupType
      .replace(/MMXM_|ICT_/g, '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Format currency value
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Toggle setup expansion
  const toggleSetupExpansion = (setupType) => {
    if (expandedSetup === setupType) {
      setExpandedSetup(null);
    } else {
      setExpandedSetup(setupType);
    }
  };
  
  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortKey !== key) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  // If no data, display message
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg dark:bg-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No setup performance data available</p>
      </div>
    );
  }
  
  return (
    <div className="setup-performance">
      {/* Setup Performance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                scope="col" 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-400"
                onClick={() => handleSort('setupType')}
              >
                Setup Type
                {renderSortIcon('setupType')}
              </th>
              <th 
                scope="col" 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-400"
                onClick={() => handleSort('winRate')}
              >
                Win Rate
                {renderSortIcon('winRate')}
              </th>
              <th 
                scope="col" 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-400"
                onClick={() => handleSort('tradeCount')}
              >
                Trades
                {renderSortIcon('tradeCount')}
              </th>
              <th 
                scope="col" 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-400"
                onClick={() => handleSort('profitFactor')}
              >
                P.Factor
                {renderSortIcon('profitFactor')}
              </th>
              <th 
                scope="col" 
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-400"
                onClick={() => handleSort('netProfit')}
              >
                Net P/L
                {renderSortIcon('netProfit')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {sortedData.map((setup, index) => (
              <React.Fragment key={setup.setupType || index}>
                <tr 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => toggleSetupExpansion(setup.setupType)}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium dark:text-white">
                    {formatSetupName(setup.setupType)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {setup.winRate}%
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {setup.tradeCount}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {setup.profitFactor?.toFixed(2) || '-'}
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm ${
                    setup.netProfit > 0 ? 'text-green-600' : 
                    setup.netProfit < 0 ? 'text-red-600' : 
                    'text-gray-600 dark:text-gray-300'
                  }`}>
                    {setup.netProfit >= 0 ? '+' : ''}
                    {formatCurrency(setup.netProfit)}
                  </td>
                </tr>
                
                {/* Expanded Details Row */}
                {expandedSetup === setup.setupType && (
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <td colSpan="5" className="px-3 py-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="detail-item">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Average Win</div>
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(setup.averageWin)}
                          </div>
                        </div>
                        
                        <div className="detail-item">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Average Loss</div>
                          <div className="text-sm font-medium text-red-600">
                            {formatCurrency(setup.averageLoss)}
                          </div>
                        </div>
                        
                        <div className="detail-item">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Win/Loss Ratio</div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {setup.winLossRatio?.toFixed(2) || '-'}
                          </div>
                        </div>
                        
                        <div className="detail-item">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Average R:R</div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {setup.averageRR?.toFixed(2) || '-'}
                          </div>
                        </div>
                        
                        <div className="detail-item">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Largest Win</div>
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(setup.largestWin)}
                          </div>
                        </div>
                        
                        <div className="detail-item">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Largest Loss</div>
                          <div className="text-sm font-medium text-red-600">
                            {formatCurrency(setup.largestLoss)}
                          </div>
                        </div>
                        
                        {setup.notes && (
                          <div className="detail-item col-span-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Notes</div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              {setup.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary Information */}
      <div className="mt-4 p-3 bg-gray-50 rounded dark:bg-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Setup Comparison
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Click on any setup row to see detailed performance metrics. Sort by different columns to identify your most and least effective trading setups.
        </p>
        
        {data.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-700 dark:text-gray-300">
              <span className="font-medium">Best setup by win rate:</span>{' '}
              {formatSetupName(data.sort((a, b) => b.winRate - a.winRate)[0].setupType)} ({data.sort((a, b) => b.winRate - a.winRate)[0].winRate}%)
            </div>
            <div className="text-xs text-gray-700 dark:text-gray-300">
              <span className="font-medium">Best setup by profit:</span>{' '}
              {formatSetupName(data.sort((a, b) => b.netProfit - a.netProfit)[0].setupType)} ({formatCurrency(data.sort((a, b) => b.netProfit - a.netProfit)[0].netProfit)})
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupPerformance;
