import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const WinRateWidget = ({ winRate }) => {
  // Default win rate if not provided
  const rate = winRate || 0;
  
  // Calculate losing rate
  const loseRate = 1 - rate;
  
  // Format win rate as percentage
  const winRatePercent = (rate * 100).toFixed(1);
  
  // Chart data
  const chartData = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        data: [rate, loseRate],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
        hoverOffset: 4
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${(value * 100).toFixed(1)}%`;
          }
        }
      }
    }
  };

  // Get color based on win rate
  const getColorClass = (rate) => {
    if (rate >= 0.6) return 'text-green-500';
    if (rate >= 0.5) return 'text-blue-500';
    return 'text-red-500';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Win Rate</h3>
        <div className="card-actions">
          <button className="card-action">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
      <div className="card-content win-rate-widget">
        <div className="win-rate-chart">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="win-rate-center">
            <span className={`win-rate-value ${getColorClass(rate)}`}>
              {winRatePercent}%
            </span>
            <span className="win-rate-label">Win Rate</span>
          </div>
        </div>
        <div className="win-rate-stats">
          <div className="win-rate-stat">
            <div className="stat-label">
              <span className="stat-color win"></span>
              <span>Wins</span>
            </div>
            <div className="stat-value">{(rate * 100).toFixed(1)}%</div>
          </div>
          <div className="win-rate-stat">
            <div className="stat-label">
              <span className="stat-color loss"></span>
              <span>Losses</span>
            </div>
            <div className="stat-value">{(loseRate * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinRateWidget;
