// File: frontend/src/components/dashboard/PerformanceSummary.js
// Purpose: Component displaying a summary of trading performance metrics

import React from 'react';
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
  Filler,
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

const PerformanceSummary = ({ metrics }) => {
  // Handle the case when metrics is null or undefined
  if (!metrics) {
    return (
      <div className="performance-summary">
        <h2>Performance Summary</h2>
        <div className="loading-message">Loading performance data...</div>
      </div>
    );
  }

  // Extract key metrics for display
  const {
    winRate,
    averageWin,
    averageLoss,
    profitFactor,
    totalTrades,
    netProfit,
    dailyPnL = [] // Default to empty array if not provided
  } = metrics;

  // Calculate profit/loss color based on value
  const getPnLColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Prepare chart data for daily P&L
  const chartData = {
    labels: dailyPnL.map(day => day.date),
    datasets: [
      {
        label: 'Daily P&L',
        data: dailyPnL.map(day => day.pnl),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: dailyPnL.map(day => 
          day.pnl >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
        )
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            return `P&L: ${value >= 0 ? '+' : ''}$${value.toFixed(2)}`;
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
        },
        ticks: {
          callback: value => `$${value}`
        }
      }
    }
  };

  return (
    <div className="performance-summary p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Performance Summary</h2>
      
      {/* P&L Summary */}
      <div className="mb-4">
        <div className={`text-3xl font-bold ${getPnLColor(netProfit)}`}>
          {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Net P&L</div>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="metric-card p-2 bg-gray-50 rounded dark:bg-gray-700">
          <div className="text-lg font-semibold">{winRate}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Win Rate</div>
        </div>
        
        <div className="metric-card p-2 bg-gray-50 rounded dark:bg-gray-700">
          <div className="text-lg font-semibold">{profitFactor.toFixed(2)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Profit Factor</div>
        </div>
        
        <div className="metric-card p-2 bg-gray-50 rounded dark:bg-gray-700">
          <div className="text-lg font-semibold text-green-600">+${averageWin.toFixed(2)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Win</div>
        </div>
        
        <div className="metric-card p-2 bg-gray-50 rounded dark:bg-gray-700">
          <div className="text-lg font-semibold text-red-600">-${Math.abs(averageLoss).toFixed(2)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Loss</div>
        </div>
      </div>
      
      {/* Trade Count */}
      <div className="mb-4">
        <div className="text-md font-medium">{totalTrades} Total Trades</div>
        <div className="text-sm">
          <span className="text-green-600">{Math.round(totalTrades * winRate / 100)} Winners</span> | 
          <span className="text-red-600"> {totalTrades - Math.round(totalTrades * winRate / 100)} Losers</span>
        </div>
      </div>
      
      {/* P&L Chart */}
      <div className="chart-container h-40">
        {dailyPnL.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            No daily P&L data available
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceSummary;
