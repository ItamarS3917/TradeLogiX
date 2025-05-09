// File: frontend/src/components/statistics/WinRateChart.js
// Purpose: Chart component for displaying win rates by setup type

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WinRateChart = ({ data = [] }) => {
  const [chartData, setChartData] = useState(null);

  // Format the data for the chart when it changes
  useEffect(() => {
    if (data && data.length > 0) {
      prepareChartData();
    }
  }, [data]);

  // Prepare the chart data
  const prepareChartData = () => {
    // Sort data by win rate descending
    const sortedData = [...data].sort((a, b) => b.winRate - a.winRate);
    
    // Process the data for the chart
    const formattedData = {
      labels: sortedData.map(item => formatSetupName(item.setupType)),
      datasets: [
        {
          label: 'Win Rate (%)',
          data: sortedData.map(item => item.winRate),
          backgroundColor: sortedData.map(item => 
            item.winRate >= 70 ? 'rgba(75, 192, 192, 0.8)' :
            item.winRate >= 50 ? 'rgba(54, 162, 235, 0.8)' :
            item.winRate >= 30 ? 'rgba(255, 206, 86, 0.8)' :
            'rgba(255, 99, 132, 0.8)'
          ),
          borderColor: sortedData.map(item => 
            item.winRate >= 70 ? 'rgba(75, 192, 192, 1)' :
            item.winRate >= 50 ? 'rgba(54, 162, 235, 1)' :
            item.winRate >= 30 ? 'rgba(255, 206, 86, 1)' :
            'rgba(255, 99, 132, 1)'
          ),
          borderWidth: 1,
        },
        {
          label: 'Trade Count',
          data: sortedData.map(item => item.tradeCount),
          backgroundColor: 'rgba(153, 102, 255, 0.4)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1',
        }
      ]
    };
    
    setChartData(formattedData);
  };

  // Format the setup name for display
  const formatSetupName = (setupType) => {
    if (!setupType) return 'Unknown';
    
    // Remove prefix and convert to title case
    return setupType
      .replace(/MMXM_|ICT_/g, '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (label === 'Win Rate (%)') {
              return `Win Rate: ${value}%`;
            } else if (label === 'Trade Count') {
              return `Trades: ${value}`;
            }
            
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Win Rate (%)'
        },
        max: 100,
        ticks: {
          callback: value => `${value}%`
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)'
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'Trade Count'
        },
        grid: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg dark:bg-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No setup data available</p>
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
    <div className="win-rate-chart">
      <div className="chart-container h-60">
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="chart-legend mt-4 grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={index} className="legend-item flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ 
                backgroundColor: item.winRate >= 70 ? 'rgba(75, 192, 192, 0.8)' :
                item.winRate >= 50 ? 'rgba(54, 162, 235, 0.8)' :
                item.winRate >= 30 ? 'rgba(255, 206, 86, 0.8)' :
                'rgba(255, 99, 132, 0.8)'
              }}
            ></div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {formatSetupName(item.setupType)}: {item.winRate}% ({item.tradeCount} trades)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinRateChart;
