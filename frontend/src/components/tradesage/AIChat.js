// File: frontend/src/components/tradesage/AIChat.js
// Purpose: AI chat interface for interacting with the TradeSage assistant

import React, { useState, useEffect, useRef } from 'react';

// Import MCP client
import { useMcpClient } from '../../services/mcp_client';

// Import services
import { answerQuestion, getInsights } from '../../services/tradesage_service';

// Import components
import { Loading, Alert } from '../common';

const AIChat = () => {
  // State for chat
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // MCP client hooks
  const { mcpClient, mcpConnected } = useMcpClient();
  
  // Ref for auto-scrolling chat
  const messagesEndRef = useRef(null);
  
  // Add welcome message on component mount
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        content: "Hello! I'm TradeSage, your AI trading assistant. How can I help you today? You can ask me about your trading performance, patterns in your trades, or for advice on improving your strategy.",
        timestamp: new Date()
      }
    ]);
  }, []);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle input change
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);
    
    try {
      // Get AI response
      let aiResponse;
      
      if (mcpConnected) {
        // Use MCP client for enhanced AI capabilities
        aiResponse = await mcpClient.callServer('ai', 'chat', {
          message: input,
          history: messages.map(m => ({
            role: m.sender === 'user' ? 'human' : 'assistant',
            content: m.content
          }))
        });
      } else {
        // Fallback to regular API
        aiResponse = await answerQuestion(input);
      }
      
      // Add AI response to chat
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: aiResponse.answer,
        timestamp: new Date(),
        insights: aiResponse.insights || []
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      setLoading(false);
    } catch (err) {
      console.error('Error getting AI response:', err);
      setError('Sorry, I had trouble processing your request. Please try again.');
      setLoading(false);
    }
  };
  
  // Get trade insights from AI
  const getTradeInsights = async () => {
    try {
      setLoading(true);
      
      const insights = await getInsights();
      
      // Add insights message to chat
      const insightsMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        content: "Here are some insights based on your recent trading activity:",
        timestamp: new Date(),
        insights: insights
      };
      
      setMessages(prevMessages => [...prevMessages, insightsMessage]);
      setLoading(false);
    } catch (err) {
      console.error('Error getting insights:', err);
      setError('Sorry, I had trouble retrieving insights. Please try again.');
      setLoading(false);
    }
  };
  
  // Render chat message
  const renderMessage = (message) => {
    return (
      <div 
        key={message.id} 
        className={`chat-message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
      >
        <div className="message-content">
          <p>{message.content}</p>
          
          {/* Render insights if present */}
          {message.insights && message.insights.length > 0 && (
            <div className="insights-container">
              <h4>Insights:</h4>
              <ul className="insights-list">
                {message.insights.map((insight, index) => (
                  <li key={index} className="insight-item">
                    <span className="insight-title">{insight.title}:</span> {insight.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="message-timestamp">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="ai-chat-container">
      <div className="chat-header">
        <h2>TradeSage Assistant</h2>
        <button 
          className="btn btn-secondary"
          onClick={getTradeInsights}
          disabled={loading}
        >
          Get Insights
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.map(renderMessage)}
        
        {loading && (
          <div className="chat-message ai-message loading-message">
            <div className="loading-indicator">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
        
        {error && <Alert type="error" message={error} />}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask TradeSage a question..."
          disabled={loading}
          className="chat-input"
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
      
      {/* TODO: Add suggested questions */}
      {/* TODO: Add voice input option */}
      {/* TODO: Add MCP-powered visualization options */}
      {/* TODO: Implement typing indicator for AI responses */}
    </div>
  );
};

export default AIChat;