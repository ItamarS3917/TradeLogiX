import React from 'react';
import { Link } from 'react-router-dom';

const RecentTradesWidget = ({ trades }) => {
  // If no trades are provided, show loading or empty state
  if (!trades || trades.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Trades</h3>
        </div>
        <div className="card-content">
          <div className="recent-trades-empty">
            <p>No recent trades available</p>
            <Link to="/journal" className="btn-primary">
              Log a Trade
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Function to format trade outcome with color coding
  const formatOutcome = (outcome) => {
    let color = '';
    
    switch (outcome) {
      case 'WIN':
        color = 'text-green-500';
        break;
      case 'LOSS':
        color = 'text-red-500';
        break;
      case 'BREAKEVEN':
        color = 'text-gray-500';
        break;
      default:
        color = 'text-gray-500';
    }
    
    return <span className={color}>{outcome}</span>;
  };

  // Function to format date/time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Function to format profit/loss with color coding
  const formatProfitLoss = (amount) => {
    const isPositive = amount >= 0;
    const color = isPositive ? 'text-green-500' : 'text-red-500';
    const prefix = isPositive ? '+' : '';
    
    return <span className={color}>{prefix}${amount.toFixed(2)}</span>;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Trades</h3>
        <div className="card-actions">
          <Link to="/journal" className="card-action-link">
            View All
          </Link>
        </div>
      </div>
      <div className="card-content">
        <div className="recent-trades">
          <table className="trades-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Setup</th>
                <th>Date</th>
                <th>P&L</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id}>
                  <td className="trade-symbol">{trade.symbol}</td>
                  <td>{trade.setup_type}</td>
                  <td>{formatDateTime(trade.entry_time)}</td>
                  <td>{formatProfitLoss(trade.profit_loss)}</td>
                  <td>{formatOutcome(trade.outcome)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentTradesWidget;
