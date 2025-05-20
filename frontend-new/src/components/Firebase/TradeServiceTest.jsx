// File: TradeServiceTest.jsx
// Purpose: Component to test Firebase trade service

import React, { useState, useEffect } from 'react';
import { tradeService } from '../../services/serviceFactory';

const TradeServiceTest = () => {
  const [status, setStatus] = useState('');
  const [trades, setTrades] = useState([]);
  const [createdTradeId, setCreatedTradeId] = useState(null);
  const [isFirebaseDirect, setIsFirebaseDirect] = useState(
    import.meta.env.VITE_USE_FIREBASE_DIRECTLY === 'true'
  );

  useEffect(() => {
    // Get trades on component mount
    testGetTrades();
  }, []);

  // Test getting trades
  const testGetTrades = async () => {
    try {
      setStatus('Getting trades...');
      
      // Get all trades
      const response = await tradeService.getAllTrades();
      
      // Set trades
      setTrades(Array.isArray(response) ? response : []);
      setStatus(`Found ${Array.isArray(response) ? response.length : 0} trades`);
    } catch (error) {
      setStatus(`Error getting trades: ${error.message}`);
      console.error('Trade service get trades error:', error);
    }
  };

  // Test creating a trade
  const testCreateTrade = async () => {
    try {
      setStatus('Creating trade...');
      
      // Create sample trade data
      const tradeData = {
        user_id: '1',
        symbol: 'NQ',
        setup_type: 'ICT_BPR',
        entry_price: 18000 + Math.random() * 1000,
        exit_price: 18050 + Math.random() * 1000,
        position_size: 1.0,
        entry_time: new Date(),
        exit_time: new Date(Date.now() + 3600000), // 1 hour later
        planned_risk_reward: 3.0,
        actual_risk_reward: 2.5,
        outcome: 'Win',
        profit_loss: 50.0,
        emotional_state: 'Calm',
        plan_adherence: 'Followed',
        notes: 'Test trade',
        tags: ['test', 'firebase']
      };
      
      // Create trade
      const createdTrade = await tradeService.createTrade(tradeData);
      
      // Set created trade ID
      setCreatedTradeId(createdTrade.id);
      setStatus(`Trade created with ID: ${createdTrade.id}`);
      
      // Refresh trades
      testGetTrades();
    } catch (error) {
      setStatus(`Error creating trade: ${error.message}`);
      console.error('Trade service create trade error:', error);
    }
  };

  // Test updating a trade
  const testUpdateTrade = async () => {
    try {
      if (!createdTradeId) {
        setStatus('Please create a trade first');
        return;
      }
      
      setStatus(`Updating trade with ID: ${createdTradeId}...`);
      
      // Update data
      const updateData = {
        notes: `Updated test trade at ${new Date().toLocaleTimeString()}`,
        tags: ['test', 'firebase', 'updated']
      };
      
      // Update trade
      const updatedTrade = await tradeService.updateTrade(createdTradeId, updateData);
      
      setStatus(`Trade updated: ${updatedTrade.notes}`);
      
      // Refresh trades
      testGetTrades();
    } catch (error) {
      setStatus(`Error updating trade: ${error.message}`);
      console.error('Trade service update trade error:', error);
    }
  };

  // Test deleting a trade
  const testDeleteTrade = async () => {
    try {
      if (!createdTradeId) {
        setStatus('Please create a trade first');
        return;
      }
      
      setStatus(`Deleting trade with ID: ${createdTradeId}...`);
      
      // Delete trade
      const result = await tradeService.deleteTrade(createdTradeId);
      
      setStatus(`Trade deleted: ${result.detail || 'success'}`);
      setCreatedTradeId(null);
      
      // Refresh trades
      testGetTrades();
    } catch (error) {
      setStatus(`Error deleting trade: ${error.message}`);
      console.error('Trade service delete trade error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Trade Service Test ({isFirebaseDirect ? 'Firebase Direct' : 'API'})</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testGetTrades}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4285F4', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Get Trades
        </button>
        
        <button 
          onClick={testCreateTrade}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#34A853', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Create Trade
        </button>
        
        <button 
          onClick={testUpdateTrade}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#FBBC05', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
          disabled={!createdTradeId}
        >
          Update Trade
        </button>
        
        <button 
          onClick={testDeleteTrade}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#EA4335', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          disabled={!createdTradeId}
        >
          Delete Trade
        </button>
      </div>
      
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <strong>Status:</strong> {status}
      </div>
      
      {createdTradeId && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e0f7e0',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Created Trade ID:</strong> {createdTradeId}
        </div>
      )}
      
      {trades.length > 0 ? (
        <div>
          <h3>Trades ({trades.length})</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {trades.map((trade) => (
              <li key={trade.id} style={{ 
                padding: '10px', 
                margin: '5px 0',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}>
                <strong>ID:</strong> {trade.id}<br />
                <strong>Symbol:</strong> {trade.symbol}<br />
                <strong>Setup:</strong> {trade.setup_type}<br />
                <strong>Entry Price:</strong> {trade.entry_price}<br />
                <strong>Exit Price:</strong> {trade.exit_price}<br />
                <strong>P&L:</strong> {trade.profit_loss}<br />
                <strong>Notes:</strong> {trade.notes}<br />
                <strong>Tags:</strong> {Array.isArray(trade.tags) ? trade.tags.join(', ') : JSON.stringify(trade.tags)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>No trades found</div>
      )}
    </div>
  );
};

export default TradeServiceTest;
