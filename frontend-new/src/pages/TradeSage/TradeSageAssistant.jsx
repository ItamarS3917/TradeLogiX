import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  Grid, 
  Paper, 
  CircularProgress, 
  IconButton,
  Switch,
  FormControlLabel,
  Chip,
  useTheme 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PsychologyIcon from '@mui/icons-material/Psychology';
import tradesageService from '../../services/tradeSageService';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import PatternVisualization from './PatternVisualization';
import ImprovementPlan from './ImprovementPlan';

// Message types
const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  PATTERN: 'pattern',
  PLAN: 'plan'
};

const TradeSageAssistant = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([
    {
      type: MESSAGE_TYPES.AI,
      text: "Hello! I'm TradeSage, your AI trading assistant. How can I help improve your trading today?",
      timestamp: new Date(),
    }
  ]);
  const [useMcp, setUseMcp] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat on new messages
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    // Add user message to conversation
    const userMessage = {
      type: MESSAGE_TYPES.USER,
      text: question,
      timestamp: new Date(),
    };
    
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      // Get answer from TradeSage
      const response = await tradesageService.askQuestion(
        question, 
        null, 
        currentUser?.id
      );
      
      // Add AI response to conversation
      const aiMessage = {
        type: MESSAGE_TYPES.AI,
        text: response.answer,
        confidence: response.confidence,
        sources: response.sources,
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, aiMessage]);
      setQuestion('');
    } catch (error) {
      console.error('Error getting answer from TradeSage:', error);
      showSnackbar('Error getting answer. Please try again.', 'error');
      
      // Add error message
      const errorMessage = {
        type: MESSAGE_TYPES.AI,
        text: "I'm sorry, I couldn't process your question right now. Please try again later.",
        error: true,
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePatterns = async () => {
    if (analysisLoading) return;
    
    setAnalysisLoading(true);
    
    try {
      // Add message about analysis
      const analysisMessage = {
        type: MESSAGE_TYPES.USER,
        text: "Please analyze my trading patterns.",
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, analysisMessage]);
      
      // Request pattern analysis
      const userId = currentUser?.id;
      const endDate = new Date().toISOString().split('T')[0]; // today
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 90 days ago
      
      // Get complex patterns if MCP is enabled
      let patterns = [];
      let insights = [];
      let recommendations = [];
      let summary = '';
      
      if (useMcp) {
        const complexResult = await tradesageService.analyzeComplexPatterns({
          user_id: userId,
          start_date: startDate,
          end_date: endDate
        });
        
        patterns = complexResult.patterns || [];
        insights = complexResult.insights || [];
      }
      
      // Get standard analysis
      const analysisResult = await tradesageService.analyzePatterns({
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        use_mcp: useMcp
      });
      
      // Combine results
      patterns = [...patterns, ...(analysisResult.patterns || [])];
      insights = [...insights, ...(analysisResult.insights || [])];
      recommendations = analysisResult.recommendations || [];
      summary = analysisResult.summary || '';
      
      // Add pattern message to conversation
      const patternMessage = {
        type: MESSAGE_TYPES.PATTERN,
        patterns,
        insights,
        recommendations,
        summary,
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, patternMessage]);
      
      // Add follow-up message
      const followUpMessage = {
        type: MESSAGE_TYPES.AI,
        text: "Is there any specific aspect of these patterns you'd like me to explain further?",
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, followUpMessage]);
      
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      showSnackbar('Error analyzing patterns. Please try again.', 'error');
      
      // Add error message
      const errorMessage = {
        type: MESSAGE_TYPES.AI,
        text: "I'm sorry, I couldn't analyze your trading patterns right now. Please try again later.",
        error: true,
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleGenerateImprovementPlan = async () => {
    if (planLoading) return;
    
    setPlanLoading(true);
    
    try {
      // Add message about plan generation
      const planRequestMessage = {
        type: MESSAGE_TYPES.USER,
        text: "Please generate an improvement plan for my trading.",
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, planRequestMessage]);
      
      // Request improvement plan
      const userId = currentUser?.id;
      const plan = await tradesageService.generateImprovementPlan(userId, useMcp);
      
      // Add plan message to conversation
      const planMessage = {
        type: MESSAGE_TYPES.PLAN,
        plan,
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, planMessage]);
      
      // Add follow-up message
      const followUpMessage = {
        type: MESSAGE_TYPES.AI,
        text: "Here's your personalized improvement plan. Would you like me to explain any specific part in more detail?",
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, followUpMessage]);
      
    } catch (error) {
      console.error('Error generating improvement plan:', error);
      showSnackbar('Error generating improvement plan. Please try again.', 'error');
      
      // Add error message
      const errorMessage = {
        type: MESSAGE_TYPES.AI,
        text: "I'm sorry, I couldn't generate your improvement plan right now. Please try again later.",
        error: true,
        timestamp: new Date(),
      };
      
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setPlanLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message, index) => {
    const isUser = message.type === MESSAGE_TYPES.USER;
    const isAI = message.type === MESSAGE_TYPES.AI;
    const isPattern = message.type === MESSAGE_TYPES.PATTERN;
    const isPlan = message.type === MESSAGE_TYPES.PLAN;

    return (
      <Box 
        key={index}
        sx={{ 
          display: 'flex', 
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
          width: '100%'
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 2,
            maxWidth: isPattern || isPlan ? '90%' : '70%',
            width: isPattern || isPlan ? '90%' : 'auto',
            borderRadius: 2,
            bgcolor: isUser 
              ? theme.palette.primary.light 
              : isAI 
                ? theme.palette.background.paper
                : theme.palette.background.default,
            color: isUser ? theme.palette.primary.contrastText : 'inherit',
            position: 'relative'
          }}
        >
          {/* Header with icon */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {!isUser && (
              <Box mr={1}>
                {isAI && <PsychologyIcon fontSize="small" />}
                {isPattern && <AnalyticsIcon fontSize="small" />}
                {isPlan && <EmojiObjectsIcon fontSize="small" />}
              </Box>
            )}
            <Typography 
              variant="subtitle2" 
              color={isUser ? 'inherit' : 'text.secondary'}
            >
              {isUser ? 'You' : 'TradeSage'} • {formatTimestamp(message.timestamp)}
            </Typography>
            
            {/* Confidence level chip */}
            {isAI && message.confidence && (
              <Chip
                label={`${Math.round(message.confidence * 100)}% confidence`}
                size="small"
                sx={{ ml: 1, height: 20 }}
                color={
                  message.confidence >= 0.8 ? 'success' :
                  message.confidence >= 0.5 ? 'warning' :
                  'error'
                }
              />
            )}
          </Box>
          
          {/* Message content */}
          {isAI || isUser ? (
            <Typography 
              variant="body1" 
              sx={{ whiteSpace: 'pre-line' }}
              color={message.error ? 'error.main' : 'inherit'}
            >
              {message.text}
            </Typography>
          ) : isPattern ? (
            <PatternVisualization 
              patterns={message.patterns}
              insights={message.insights}
              recommendations={message.recommendations}
              summary={message.summary}
            />
          ) : isPlan ? (
            <ImprovementPlan plan={message.plan} />
          ) : null}
          
          {/* Sources if available */}
          {isAI && message.sources && message.sources.length > 0 && (
            <Box mt={1}>
              <Typography variant="caption" color="text.secondary">
                Based on {message.sources.map(source => 
                  `${source.count} ${source.type}`
                ).join(', ')}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <PsychologyIcon fontSize="large" />
          </Grid>
          <Grid item xs>
            <Typography variant="h5">TradeSage AI Assistant</Typography>
            <Typography variant="body2" color="text.secondary">
              Your personal trading coach powered by MCP (Model Context Protocol)
            </Typography>
          </Grid>
          <Grid item>
            <FormControlLabel 
              control={
                <Switch 
                  checked={useMcp} 
                  onChange={(e) => setUseMcp(e.target.checked)} 
                  color="primary"
                />
              } 
              label={
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                    MCP Enhanced
                  </Typography>
                  <Chip 
                    size="small" 
                    label="AI" 
                    sx={{ height: 20 }} 
                    color={useMcp ? "secondary" : "default"} 
                  />
                </Box>
              }
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Chat area */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          px: 2, 
          height: 'calc(100vh - 240px)',
          bgcolor: theme.palette.grey[50]
        }}
      >
        {conversation.map(renderMessage)}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, bgcolor: theme.palette.background.paper }}>
        <Button 
          variant="outlined" 
          startIcon={<AnalyticsIcon />} 
          onClick={handleAnalyzePatterns}
          disabled={analysisLoading}
          sx={{ mx: 1 }}
        >
          {analysisLoading ? <CircularProgress size={24} /> : 'Analyze Patterns'}
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<EmojiObjectsIcon />} 
          onClick={handleGenerateImprovementPlan}
          disabled={planLoading}
          sx={{ mx: 1 }}
        >
          {planLoading ? <CircularProgress size={24} /> : 'Generate Improvement Plan'}
        </Button>
      </Box>
      
      {/* Input area */}
      <Paper elevation={2} sx={{ p: 2, mt: 'auto' }}>
        <form onSubmit={handleSendQuestion}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask TradeSage a question about your trading..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
                size="medium"
              />
            </Grid>
            <Grid item>
              <IconButton 
                color="primary" 
                type="submit" 
                disabled={loading || !question.trim()} 
                sx={{ 
                  bgcolor: theme.palette.primary.main, 
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                  '&:disabled': {
                    bgcolor: theme.palette.action.disabledBackground,
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TradeSageAssistant;
