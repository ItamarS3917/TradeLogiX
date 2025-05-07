// File: frontend/src/components/trades/TradeForm.js
// Purpose: Form component for entering or editing trade details

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Import MCP client
import { useMcpClient } from '../../services/mcp_client';

// Import API services
import { createTrade, updateTrade, getTrade } from '../../services/trade_service';
import { getDailyPlan } from '../../services/plan_service';

// Import components
import { Alert, Loading } from '../common';

const TradeForm = ({ isEditing = false }) => {
  const { tradeId } = useParams();
  const navigate = useNavigate();
  
  // MCP client hooks
  const { mcpClient, mcpConnected } = useMcpClient();
  
  // Form state
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Trade data state
  const [formData, setFormData] = useState({
    symbol: 'NQ',
    setupType: '',
    entryPrice: '',
    exitPrice: '',
    positionSize: '',
    entryTime: '',
    exitTime: '',
    plannedRiskReward: '',
    outcome: '',
    emotionalState: '',
    planAdherence: 5, // Scale 1-10
    notes: '',
    screenshots: [],
    tags: []
  });
  
  // Setup types (would be loaded from configuration or API)
  const setupTypes = [
    'BPR (Buy Pressure Release)',
    'SPR (Sell Pressure Release)',
    'OTE (Optimal Trade Entry)',
    'Fair Value Gap',
    'Liquidity Sweep',
    'Order Block',
    'Break of Structure',
    'Other'
  ];
  
  // Outcome options
  const outcomeOptions = ['Win', 'Loss', 'Breakeven'];
  
  // Emotional state options
  const emotionalStates = [
    'Calm',
    'Excited',
    'Anxious',
    'Confident',
    'Fearful',
    'Frustrated',
    'Impatient',
    'Neutral'
  ];
  
  // Load trade data if editing
  useEffect(() => {
    const fetchTradeData = async () => {
      if (isEditing && tradeId) {
        try {
          setLoading(true);
          const trade = await getTrade(tradeId);
          
          if (trade) {
            // Format dates for form inputs
            const formattedEntryTime = formatDateTimeForInput(trade.entryTime);
            const formattedExitTime = formatDateTimeForInput(trade.exitTime);
            
            setFormData({
              ...trade,
              entryTime: formattedEntryTime,
              exitTime: formattedExitTime
            });
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching trade:', err);
          setError('Failed to load trade data. Please try again.');
          setLoading(false);
        }
      }
    };
    
    fetchTradeData();
  }, [isEditing, tradeId]);
  
  // Helper function to format datetime for input
  const formatDateTimeForInput = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle tag changes
  const handleTagChange = (selectedTags) => {
    setFormData(prevData => ({
      ...prevData,
      tags: selectedTags
    }));
  };
  
  // Handle file upload for screenshots
  const handleScreenshotUpload = (files) => {
    // TODO: Implement file upload logic
    // TODO: Use MCP for screenshot processing and analysis
  };
  
  // Calculate profit/loss
  const calculateProfitLoss = () => {
    const { entryPrice, exitPrice, positionSize } = formData;
    
    if (entryPrice && exitPrice && positionSize) {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const size = parseFloat(positionSize);
      
      // TODO: Implement actual calculation based on instrument
      const profitLoss = (exit - entry) * size;
      
      setFormData(prevData => ({
        ...prevData,
        profitLoss
      }));
    }
  };
  
  // Use MCP to analyze trade setup
  const analyzeTradeSetup = async () => {
    if (mcpConnected) {
      try {
        // TODO: Implement MCP-powered trade analysis
        // This would call the MCP trade analysis server
        const analysis = await mcpClient.callServer('trade_analysis', 'analyze_setup', formData);
        
        // Update form with analysis results
        setFormData(prevData => ({
          ...prevData,
          setupType: analysis.recommendedSetupType || prevData.setupType,
          // Other fields that might be populated by analysis
        }));
      } catch (err) {
        console.error('Error analyzing trade setup:', err);
        // Don't set error state to avoid interrupting form submission
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Calculate final profit/loss
      calculateProfitLoss();
      
      // Use MCP to analyze trade if connected
      if (mcpConnected) {
        await analyzeTradeSetup();
      }
      
      // Prepare data for submission
      const submissionData = {
        ...formData,
        // Format dates for API
        entryTime: new Date(formData.entryTime).toISOString(),
        exitTime: new Date(formData.exitTime).toISOString()
      };
      
      // Submit to API
      if (isEditing) {
        await updateTrade(tradeId, submissionData);
      } else {
        await createTrade(submissionData);
      }
      
      setSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate('/trades');
      }, 1500);
    } catch (err) {
      console.error('Error submitting trade:', err);
      setError('Failed to save trade. Please try again.');
      setSubmitting(false);
    }
  };
  
  if (loading) return <Loading message="Loading trade data..." />;
  
  return (
    <div className="trade-form-container">
      <h2>{isEditing ? 'Edit Trade' : 'Log New Trade'}</h2>
      
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message="Trade saved successfully!" />}
      
      <form onSubmit={handleSubmit} className="trade-form">
        {/* Basic Trade Information */}
        <div className="form-section">
          <h3>Trade Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="symbol">Symbol</label>
              <input
                type="text"
                id="symbol"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="setupType">Setup Type</label>
              <select
                id="setupType"
                name="setupType"
                value={formData.setupType}
                onChange={handleChange}
                required
              >
                <option value="">Select Setup Type</option>
                {setupTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="entryPrice">Entry Price</label>
              <input
                type="number"
                id="entryPrice"
                name="entryPrice"
                value={formData.entryPrice}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="exitPrice">Exit Price</label>
              <input
                type="number"
                id="exitPrice"
                name="exitPrice"
                value={formData.exitPrice}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="positionSize">Position Size</label>
              <input
                type="number"
                id="positionSize"
                name="positionSize"
                value={formData.positionSize}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="entryTime">Entry Time</label>
              <input
                type="datetime-local"
                id="entryTime"
                name="entryTime"
                value={formData.entryTime}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="exitTime">Exit Time</label>
              <input
                type="datetime-local"
                id="exitTime"
                name="exitTime"
                value={formData.exitTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        
        {/* Trade Analysis */}
        <div className="form-section">
          <h3>Trade Analysis</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="plannedRiskReward">Planned Risk:Reward</label>
              <input
                type="number"
                id="plannedRiskReward"
                name="plannedRiskReward"
                value={formData.plannedRiskReward}
                onChange={handleChange}
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="outcome">Outcome</label>
              <select
                id="outcome"
                name="outcome"
                value={formData.outcome}
                onChange={handleChange}
                required
              >
                <option value="">Select Outcome</option>
                {outcomeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emotionalState">Emotional State</label>
              <select
                id="emotionalState"
                name="emotionalState"
                value={formData.emotionalState}
                onChange={handleChange}
              >
                <option value="">Select Emotional State</option>
                {emotionalStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="planAdherence">Plan Adherence (1-10)</label>
              <input
                type="range"
                id="planAdherence"
                name="planAdherence"
                value={formData.planAdherence}
                onChange={handleChange}
                min="1"
                max="10"
              />
              <span>{formData.planAdherence}</span>
            </div>
          </div>
        </div>
        
        {/* Notes and Attachments */}
        <div className="form-section">
          <h3>Notes and Attachments</h3>
          
          <div className="form-group">
            <label htmlFor="notes">Trade Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label>Screenshots (Chart Analysis)</label>
            <div className="file-upload-area">
              {/* TODO: Implement file upload component */}
              <p>Drop files here or click to upload</p>
            </div>
          </div>
          
          <div className="form-group">
            <label>Tags</label>
            {/* TODO: Implement tag selection component */}
            <p>Select or create tags</p>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/trades')}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (isEditing ? 'Update Trade' : 'Save Trade')}
          </button>
        </div>
      </form>
      
      {/* TODO: Add MCP-powered trade analysis visualization */}
      {/* TODO: Add MCP-powered risk calculation tool */}
      {/* TODO: Add TradingView chart integration via MCP */}
    </div>
  );
};

export default TradeForm;