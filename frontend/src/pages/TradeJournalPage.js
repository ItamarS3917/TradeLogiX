import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import TradesList from '../components/trades/TradesList';
import SimpleTradeForm from '../components/trades/SimpleTradeForm';
import TradeDetail from '../components/trades/TradeDetail';

const TradeJournalPage = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('list');

  return (
    <div className="trade-journal-page">
      <div className="page-header">
        <h1>Trade Journal</h1>
        <div className="view-controls">
          <button 
            className={`view-button ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('list');
              navigate('/journal');
            }}
          >
            View Trades
          </button>
          <button 
            className={`view-button ${activeView === 'new' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('new');
              navigate('/journal/new');
            }}
          >
            Log New Trade
          </button>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<TradesList />} />
        <Route path="/new" element={<SimpleTradeForm />} />
        <Route path="/:tradeId" element={<TradeDetail />} />
        <Route path="/:tradeId/edit" element={<SimpleTradeForm />} />
      </Routes>
    </div>
  );
};

export default TradeJournalPage;
