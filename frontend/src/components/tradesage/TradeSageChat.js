import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Typography, 
  Button, 
  IconButton, 
  CircularProgress,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import InsightsIcon from '@mui/icons-material/Insights';
import { useAuth } from '../../context/AuthContext';
import TradeSageService from '../../services/tradesage_service';

// Message styling
const userMessageStyle = {
  alignSelf: 'flex-end',
  backgroundColor: '#e3f2fd',
  borderRadius: '18px 18px 4px 18px',
  padding: '12px 16px',
  maxWidth: '75%',
  marginBottom: '8px'
};

const aiMessageStyle = {
  alignSelf: 'flex-start',
  backgroundColor: '#f5f5f5',
  borderRadius: '18px 18px 18px 4px',
  padding: '12px 16px',
  maxWidth: '75%',
  marginBottom: '8px'
};

/**
 * TradeSage Chat component - AI trading assistant interface
 */
const TradeSageChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const messagesEndRef = useRef(null);

  // Default welcome message from TradeSage
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      type: 'ai',
      content: `Hi ${user?.username || 'there'}! I'm TradeSage, your AI trading assistant. I can analyze your trading patterns, provide insights, and answer questions about your trading performance. How can I help you today?`,
      timestamp: new Date().toISOString()
    };
    
    setMessages([welcomeMessage]);
    
    // Set suggested questions
    setSuggested([
      "What are my best performing setups?",
      "How can I improve my win rate?",
      "What times of day are most profitable for me?",
      "What are my emotional trading patterns?"
    ]);
    
    // Load chat history
    loadChatHistory();
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from API
  const loadChatHistory = async () => {
    try {
      if (user?.id) {
        const history = await TradeSageService.getChatHistory(user.id);
        setChatHistory(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Get response from TradeSage
      const response = await TradeSageService.askQuestion(user?.id || 1, input);
      
      // Add AI response
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: response.answer,
        timestamp: new Date().toISOString(),
        confidence: response.confidence,
        sources: response.sources
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update chat history
      await loadChatHistory();
    } catch (error) {
      console.error('Error getting TradeSage response:', error);
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: "Sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question) => {
    setInput(question);
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle getting insights from TradeSage
  const handleGetInsights = async () => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: "Can you provide insights on my trading performance?",
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      // Get insights from TradeSage
      const insights = await TradeSageService.getInsights(user?.id || 1);
      
      // Format insights for display
      let insightsText = `Based on your trading data, here's a summary of your performance:\n\n`;
      
      if (insights.overall) {
        insightsText += `**Overall Performance**\n`;
        insightsText += `- Win Rate: ${insights.overall.winRate}\n`;
        insightsText += `- Total Trades: ${insights.overall.totalTrades}\n`;
        insightsText += `- Average Profit per Trade: $${insights.overall.profitPerTrade.toFixed(2)}\n\n`;
      }
      
      if (insights.strengths && insights.strengths.length > 0) {
        insightsText += `**Strengths**\n`;
        insights.strengths.forEach(strength => {
          insightsText += `- ${strength}\n`;
        });
        insightsText += '\n';
      }
      
      if (insights.weaknesses && insights.weaknesses.length > 0) {
        insightsText += `**Areas for Improvement**\n`;
        insights.weaknesses.forEach(weakness => {
          insightsText += `- ${weakness}\n`;
        });
        insightsText += '\n';
      }
      
      if (insights.recommendations && insights.recommendations.length > 0) {
        insightsText += `**Recommendations**\n`;
        insights.recommendations.forEach(recommendation => {
          insightsText += `- ${recommendation}\n`;
        });
      }
      
      // Add AI response
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: insightsText,
        timestamp: new Date().toISOString(),
        confidence: 0.9
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting insights:', error);
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: "Sorry, I'm having trouble generating insights right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle getting improvement plan from TradeSage
  const handleGetImprovementPlan = async () => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: "What's my trading improvement plan?",
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      // Get improvement plan from TradeSage
      const plan = await TradeSageService.getImprovementPlan(user?.id || 1);
      
      // Format plan for display
      let planText = `I've developed a personalized trading improvement plan based on your performance data:\n\n`;
      
      if (plan.strengths && plan.strengths.length > 0) {
        planText += `**Your Strengths**\n`;
        plan.strengths.forEach(strength => {
          planText += `- ${strength}\n`;
        });
        planText += '\n';
      }
      
      if (plan.weaknesses && plan.weaknesses.length > 0) {
        planText += `**Areas for Improvement**\n`;
        plan.weaknesses.forEach(weakness => {
          planText += `- ${weakness}\n`;
        });
        planText += '\n';
      }
      
      if (plan.plan) {
        if (plan.plan.shortTerm && plan.plan.shortTerm.length > 0) {
          planText += `**Short-term Actions (1-2 weeks)**\n`;
          plan.plan.shortTerm.forEach(item => {
            planText += `- **${item.action}** - ${item.timeframe} - Target: ${item.measurable}\n`;
          });
          planText += '\n';
        }
        
        if (plan.plan.mediumTerm && plan.plan.mediumTerm.length > 0) {
          planText += `**Medium-term Goals (1-3 months)**\n`;
          plan.plan.mediumTerm.forEach(item => {
            planText += `- **${item.action}** - ${item.timeframe} - Target: ${item.measurable}\n`;
          });
          planText += '\n';
        }
        
        if (plan.plan.longTerm && plan.plan.longTerm.length > 0) {
          planText += `**Long-term Vision (3+ months)**\n`;
          plan.plan.longTerm.forEach(item => {
            planText += `- **${item.action}** - ${item.timeframe} - Target: ${item.measurable}\n`;
          });
          planText += '\n';
        }
      }
      
      if (plan.timeline) {
        planText += `**Implementation Timeline**\n${plan.timeline}`;
      }
      
      // Add AI response
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: planText,
        timestamp: new Date().toISOString(),
        confidence: 0.95
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting improvement plan:', error);
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: "Sorry, I'm having trouble generating an improvement plan right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle getting pattern analysis from TradeSage
  const handleAnalyzePatterns = async () => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: "Can you analyze my trading patterns?",
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      // Get pattern analysis from TradeSage
      const analysis = await TradeSageService.analyzePatterns(user?.id || 1);
      
      // Format analysis for display
      let analysisText = `**Trading Pattern Analysis**\n\n`;
      
      if (analysis.summary) {
        analysisText += `${analysis.summary}\n\n`;
      }
      
      if (analysis.insights && analysis.insights.length > 0) {
        analysisText += `**Key Insights**\n`;
        analysis.insights.forEach((insight, index) => {
          analysisText += `${index + 1}. **${insight.name}** (${insight.confidence * 100}% confidence)\n`;
          analysisText += `   ${insight.description}\n`;
          if (insight.evidence) {
            analysisText += `   Evidence: ${insight.evidence}\n`;
          }
          analysisText += '\n';
        });
      }
      
      if (analysis.recommendations && analysis.recommendations.length > 0) {
        analysisText += `**Recommendations**\n`;
        analysis.recommendations.forEach((recommendation, index) => {
          analysisText += `${index + 1}. ${recommendation}\n`;
        });
      }
      
      // Add AI response
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: analysisText,
        timestamp: new Date().toISOString(),
        confidence: 0.9
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: "Sorry, I'm having trouble analyzing your trading patterns right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '1000px', mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        TradeSage AI Assistant
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<InsightsIcon />}
          onClick={handleGetInsights}
        >
          Get Insights
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<TipsAndUpdatesIcon />}
          onClick={handleGetImprovementPlan}
        >
          Improvement Plan
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<AnalyticsIcon />}
          onClick={handleAnalyzePatterns}
        >
          Analyze Patterns
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', height: 'calc(100% - 140px)' }}>
        {/* Chat history sidebar */}
        <Paper 
          elevation={2} 
          sx={{ 
            width: '250px', 
            mr: 2, 
            p: 2, 
            overflowY: 'auto',
            display: { xs: 'none', md: 'block' }
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Recent Conversations
          </Typography>
          
          {chatHistory.length > 0 ? (
            chatHistory.map((chat) => (
              <Box key={chat.id} sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  {new Date(chat.timestamp).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
                  {chat.question}
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No recent conversations
            </Typography>
          )}
        </Paper>
        
        {/* Chat messages area */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              mb: 2,
              height: 'calc(100% - 80px)'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                flexGrow: 1
              }}
            >
              {messages.map((message) => (
                <Box 
                  key={message.id} 
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    ...(message.type === 'user' ? userMessageStyle : aiMessageStyle),
                    ...(message.isError && { backgroundColor: '#ffebee' })
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {message.content}
                  </Typography>
                  
                  {message.confidence && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, alignSelf: 'flex-end' }}>
                      Confidence: {(message.confidence * 100).toFixed(0)}%
                    </Typography>
                  )}
                </Box>
              ))}
              
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>
            
            {/* Suggested questions */}
            {messages.length < 3 && suggested.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Suggested Questions:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {suggested.map((question, index) => (
                    <Button 
                      key={index} 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
          
          {/* Input area */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Ask TradeSage a question..."
              variant="outlined"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              sx={{ mr: 1 }}
              disabled={loading}
            />
            <IconButton 
              color="primary" 
              onClick={handleSendMessage} 
              disabled={!input.trim() || loading}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TradeSageChat;
