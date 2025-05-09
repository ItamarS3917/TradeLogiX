// File: frontend/src/components/statistics/ProfitabilityByTime.js
// Purpose: Chart component for displaying profitability by time of day

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProfitabilityByTime = ({ data = [] }) => {
  const [chartData, setChartData] = useState(null);
  const [viewMode, setViewMode] = useState('profit'); // 'profit', 'trades', 'winRate'

  // Format the data for the chart when it changes or view mode changes
  useEffect(() => {
    if (data && data.length > 0) {
      prepareChartData();
    }
  }, [data, viewMode]);

  // Prepare the chart data based on the selected view mode
  const prepareChartData = () => {
    // Sort data by time slot
    const sortedData = [...data].sort((a, b) => {
      // Convert timeSlot (e.g., "9:30-10:00") to minutes for sorting
      const aStart = convertTimeToMinutes(a.timeSlot.split('-')[0]);
      const bStart = convertTimeToMinutes(b.timeSlot.split('-')[0]);
      return aStart - bStart;
    });
    
    // Select the data to display based on view mode
    let datasetLabel, datasetData, datasetColor, datasetBorderColor;
    
    switch (viewMode) {
      case 'profit':
        datasetLabel = 'Net Profit/Loss';
        datasetData = sortedData.map(item => item.netProfit);
        datasetColor = sortedData.map(item => 
          item.netProfit >= 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)'
        );
        datasetBorderColor = sortedData.map(item => 
          item.netProfit >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
        );
        break;
      case 'trades':
        datasetLabel = 'Trade Count';
        datasetData = sortedData.map(item => item.tradeCount);
        datasetColor = 'rgba(54, 162, 235, 0.2)';
        datasetBorderColor = 'rgba(54, 162, 235, 1)';
        break;
      case 'winRate':
        datasetLabel = 'Win Rate (%)';
        datasetData = sortedData.map(item => item.winRate);
        datasetColor = 'rgba(153, 102, 255, 0.2)';
        datasetBorderColor = 'rgba(153, 102, 255, 1)';
        break;
      default:
        datasetLabel = 'Net Profit/Loss';
        datasetData = sortedData.map(item => item.netProfit);
        datasetColor = 'rgba(75, 192, 192, 0.2)';
        datasetBorderColor = 'rgba(75, 192, 192, 1)';
    }
    
    // Process the data for the chart
    const formattedData = {
      labels: sortedData.map(item => item.timeSlot),
      datasets: [
        {
          label: datasetLabel,
          data: datasetData,
          backgroundColor: datasetColor,
          borderColor: datasetBorderColor,
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: viewMode === 'profit' 
            ? sortedData.map(item => item.netProfit >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)')
            : datasetBorderColor,
          pointRadius: 4
        }
      ]
    };
    
    setChartData(formattedData);
  };

  // Convert time string (e.g., "9:30") to minutes for sorting
  const convertTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.trim().split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Format currency value
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Chart options
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              
              switch (viewMode) {
                case 'profit':
                  return `Net P&L: ${formatCurrency(value)}`;
                case 'trades':
                  return `Trade Count: ${value}`;
                case 'winRate':
                  return `Win Rate: ${value}%`;
                default:
                  return `Value: ${value}`;
              }
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          grid: {
            color: 'rgba(200, 200, 200, 0.2)'
          }
        }
      }
    };
    
    // Add specific options based on view mode
    if (viewMode === 'profit') {
      baseOptions.scales.y.ticks = {
        callback: value => formatCurrency(value)
      };
    } else if (viewMode === 'winRate') {
      baseOptions.scales.y.max = 100;
      baseOptions.scales.y.ticks = {
        callback: value => `${value}%`
      };
    }
    
    return baseOptions;
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg dark:bg-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No time-based data available</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-60">
        <p>Loading chart data...</p>
      </div>
    );
  }

  return (
    <div className="profitability-by-time">
      {/* View Selector */}
      <div className="view-selector mb-4 flex space-x-2">
        <button
          className={`px-3 py-1 text-xs rounded-md ${
            viewMode === 'profit' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => handleViewModeChange('profit')}
        >
          Profit/Loss
        </button>
        <button
          className={`px-3 py-1 text-xs rounded-md ${
            viewMode === 'trades' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => handleViewModeChange('trades')}
        >
          Trade Count
        </button>
        <button
          className={`px-3 py-1 text-xs rounded-md ${
            viewMode === 'winRate' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => handleViewModeChange('winRate')}
        >
          Win Rate
        </button>
      </div>
      
      {/* Chart */}
      <div className="chart-container h-60">
        <Line data={chartData} options={getChartOptions()} />
      </div>
      
      {/* Summary Stats */}
      <div className="time-stats-summary mt-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {viewMode === 'profit' ? 'Most Profitable Times' : 
           viewMode === 'trades' ? 'Most Active Times' : 
           'Highest Win Rate Times'}
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {data
            .sort((a, b) => {
              if (viewMode === 'profit') return b.netProfit - a.netProfit;
              if (viewMode === 'trades') return b.tradeCount - a.tradeCount;
              return b.winRate - a.winRate;
            })
            .slice(0, 4) // Top 4
            .map((item, index) => (
              <div 
                key={index} 
                className="time-stat-item p-2 bg-gray-50 rounded dark:bg-gray-700 flex justify-between"
              >
                <span className="text-xs text-gray-600 dark:text-gray-300">{item.timeSlot}</span>
                <span className={`text-xs font-medium ${
                  viewMode === 'profit' && item.netProfit >= 0 ? 'text-green-600' : 
                  viewMode === 'profit' && item.netProfit < 0 ? 'text-red-600' : 
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  {viewMode === 'profit' 
                    ? `${item.netProfit >= 0 ? '+' : ''}${formatCurrency(item.netProfit)}` 
                    : viewMode === 'trades' 
                    ? `${item.tradeCount} trades` 
                    : `${item.winRate}%`}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProfitabilityByTime;
