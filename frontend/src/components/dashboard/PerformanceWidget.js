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

const PerformanceWidget = ({ data }) => {
  // If no data is provided, show loading or empty state
  if (!data) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Performance</h3>
        </div>
        <div className="card-content performance-widget-empty">
          <p>No performance data available</p>
        </div>
      </div>
    );
  }

  // Sample data for the chart (would come from props in real implementation)
  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'P&L',
        data: [150, 320, 280, 500, 420, 750],
        fill: true,
        backgroundColor: 'rgba(45, 107, 201, 0.2)',
        borderColor: 'rgba(45, 107, 201, 1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(200, 200, 200, 0.2)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Summary metrics from the data prop
  const metrics = [
    { label: 'Win Rate', value: `${(data.win_rate * 100).toFixed(1)}%` },
    { label: 'Profit Factor', value: data.profit_factor?.toFixed(2) || 'N/A' },
    { label: 'Net P&L', value: `$${data.net_profit_loss?.toFixed(2) || 0}` }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Performance</h3>
        <div className="card-actions">
          <button className="card-action">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
      <div className="card-content">
        <div className="performance-metrics">
          {metrics.map((metric, index) => (
            <div key={index} className="metric-item">
              <div className="metric-label">{metric.label}</div>
              <div className="metric-value">{metric.value}</div>
            </div>
          ))}
        </div>
        <div className="performance-chart">
          <Line data={chartData} options={chartOptions} height={200} />
        </div>
      </div>
    </div>
  );
};

export default PerformanceWidget;
