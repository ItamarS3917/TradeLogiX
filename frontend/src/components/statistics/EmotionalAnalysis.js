// File: frontend/src/components/statistics/EmotionalAnalysis.js
// Purpose: Component for analyzing the relationship between emotional states and trading performance

import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EmotionalAnalysis = ({ data }) => {
  const [chartType, setChartType] = useState('distribution'); // 'distribution', 'performance', 'profitability'
  const [pieData, setPieData] = useState(null);
  const [barData, setBarData] = useState(null);
  
  useEffect(() => {
    if (data) {
      prepareChartData();
    }
  }, [data, chartType]);
  
  // Prepare chart data based on selected chart type
  const prepareChartData = () => {
    if (!data || !data.emotions || data.emotions.length === 0) return;
    
    const emotionColors = {
      calm: 'rgba(54, 162, 235, 0.8)',
      confident: 'rgba(75, 192, 192, 0.8)',
      excited: 'rgba(255, 206, 86, 0.8)',
      fearful: 'rgba(255, 99, 132, 0.8)',
      anxious: 'rgba(153, 102, 255, 0.8)',
      frustrated: 'rgba(255, 159, 64, 0.8)',
      bored: 'rgba(201, 203, 207, 0.8)',
      overwhelmed: 'rgba(255, 99, 71, 0.8)',
      focused: 'rgba(46, 204, 113, 0.8)',
      distracted: 'rgba(142, 68, 173, 0.8)',
      // Add more emotions as needed
    };
    
    const emotions = data.emotions;
    
    if (chartType === 'distribution') {
      // Prepare pie chart for emotion distribution
      const pieChartData = {
        labels: emotions.map(emotion => emotion.name),
        datasets: [
          {
            data: emotions.map(emotion => emotion.count),
            backgroundColor: emotions.map(emotion => emotionColors[emotion.name.toLowerCase()] || 'rgba(128, 128, 128, 0.8)'),
            borderColor: emotions.map(emotion => {
              const bgColor = emotionColors[emotion.name.toLowerCase()] || 'rgba(128, 128, 128, 0.8)';
              return bgColor.replace('0.8', '1'); // Make border solid
            }),
            borderWidth: 1,
          },
        ],
      };
      
      setPieData(pieChartData);
      setBarData(null);
    } else {
      // Prepare bar chart for performance or profitability
      const barChartData = {
        labels: emotions.map(emotion => emotion.name),
        datasets: [
          {
            label: chartType === 'performance' ? 'Win Rate (%)' : 'Average P&L',
            data: emotions.map(emotion => 
              chartType === 'performance' ? emotion.winRate : emotion.averageProfit
            ),
            backgroundColor: emotions.map(emotion => emotionColors[emotion.name.toLowerCase()] || 'rgba(128, 128, 128, 0.8)'),
            borderColor: emotions.map(emotion => {
              const bgColor = emotionColors[emotion.name.toLowerCase()] || 'rgba(128, 128, 128, 0.8)';
              return bgColor.replace('0.8', '1'); // Make border solid
            }),
            borderWidth: 1,
          },
        ],
      };
      
      setBarData(barChartData);
      setPieData(null);
    }
  };
  
  // Handle chart type change
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };
  
  // Options for Pie chart
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} trades (${percentage}%)`;
          }
        }
      }
    },
  };
  
  // Options for Bar chart
  const getBarOptions = () => {
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
              
              if (chartType === 'performance') {
                return `Win Rate: ${value}%`;
              } else if (chartType === 'profitability') {
                return `Avg P&L: ${formatCurrency(value)}`;
              }
              
              return `Value: ${value}`;
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
          beginAtZero: true,
          grid: {
            color: 'rgba(200, 200, 200, 0.2)'
          }
        }
      }
    };
    
    // Add specific options based on chart type
    if (chartType === 'performance') {
      baseOptions.scales.y.max = 100;
      baseOptions.scales.y.ticks = {
        callback: value => `${value}%`
      };
    } else if (chartType === 'profitability') {
      baseOptions.scales.y.ticks = {
        callback: value => formatCurrency(value)
      };
    }
    
    return baseOptions;
  };
  
  // Format currency value
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // If no data, display message
  if (!data || !data.emotions || data.emotions.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg dark:bg-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No emotional analysis data available</p>
      </div>
    );
  }
  
  return (
    <div className="emotional-analysis">
      {/* Chart Type Selector */}
      <div className="chart-type-selector mb-4 flex space-x-2">
        <button
          className={`px-3 py-1 text-xs rounded-md ${
            chartType === 'distribution' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => handleChartTypeChange('distribution')}
        >
          Distribution
        </button>
        <button
          className={`px-3 py-1 text-xs rounded-md ${
            chartType === 'performance' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => handleChartTypeChange('performance')}
        >
          Win Rate
        </button>
        <button
          className={`px-3 py-1 text-xs rounded-md ${
            chartType === 'profitability' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => handleChartTypeChange('profitability')}
        >
          Profitability
        </button>
      </div>
      
      {/* Chart Container */}
      <div className="chart-container h-60">
        {pieData && chartType === 'distribution' && (
          <Pie data={pieData} options={pieOptions} />
        )}
        
        {barData && (chartType === 'performance' || chartType === 'profitability') && (
          <Bar data={barData} options={getBarOptions()} />
        )}
      </div>
      
      {/* Emotional Impact Analysis */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Emotional Impact Analysis
        </h3>
        
        <div className="flex flex-col space-y-2">
          {/* Best Emotional State */}
          <div className="p-2 bg-gray-50 rounded dark:bg-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Best Performing Emotional State</div>
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {data.bestEmotionByWinRate?.name || 'N/A'}
              </div>
              <div className="text-xs text-green-600">
                {data.bestEmotionByWinRate?.winRate || 0}% Win Rate
              </div>
            </div>
          </div>
          
          {/* Worst Emotional State */}
          <div className="p-2 bg-gray-50 rounded dark:bg-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Worst Performing Emotional State</div>
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {data.worstEmotionByWinRate?.name || 'N/A'}
              </div>
              <div className="text-xs text-red-600">
                {data.worstEmotionByWinRate?.winRate || 0}% Win Rate
              </div>
            </div>
          </div>
          
          {/* Most Profitable Emotional State */}
          <div className="p-2 bg-gray-50 rounded dark:bg-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Most Profitable Emotional State</div>
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {data.mostProfitableEmotion?.name || 'N/A'}
              </div>
              <div className="text-xs text-green-600">
                {formatCurrency(data.mostProfitableEmotion?.averageProfit || 0)} Avg P&L
              </div>
            </div>
          </div>
        </div>
        
        {/* MCP-Enhanced Insights */}
        {data.mcpInsights && (
          <div className="mt-4 p-3 bg-blue-50 rounded dark:bg-blue-900 dark:bg-opacity-30">
            <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
              AI-Enhanced Emotional Analysis
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              {data.mcpInsights}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionalAnalysis;
