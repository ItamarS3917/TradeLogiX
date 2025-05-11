import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Typography, 
  CircularProgress,
  Alert,
  Button,
  Divider
} from '@mui/material';
import { 
  Chat as ChatIcon,
  Insights as InsightsIcon,
  Assessment as AssessmentIcon,
  SupportAgent as SupportAgentIcon,
  Psychology as PsychologyIcon,
  Settings as SettingsIcon 
} from '@mui/icons-material';

// Import components
import AIChat from './AIChat';
import TradeSageInsights from './TradeSageInsights';
import TradeInsights from './TradeInsights';
import TradeSageChat from './TradeSageChat';

// Import MCP client
import { useMcpClient } from '../../services/mcp_client';

/**
 * Main interface for the TradeSage AI assistant
 * Provides access to different AI capabilities through tabs
 */
const TradeSageInterface = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // MCP client state
  const { mcpConnected, mcpStatus, connectMcp, disconnectMcp } = useMcpClient();
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Toggle MCP connection
  const toggleMcpConnection = () => {
    if (mcpConnected) {
      disconnectMcp();
    } else {
      connectMcp();
    }
  };
  
  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* TradeSage Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PsychologyIcon sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            TradeSage AI Assistant
          </Typography>
          
          {/* MCP Status */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: mcpConnected ? 'success.dark' : 'error.dark',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 1,
              cursor: 'pointer'
            }}
            onClick={toggleMcpConnection}
          >
            <Box 
              sx={{ 
                width: 10, 
                height: 10, 
                bgcolor: mcpConnected ? 'success.light' : 'error.light',
                borderRadius: '50%',
                mr: 1
              }} 
            />
            <Typography variant="caption">
              {mcpConnected ? 'MCP Connected' : 'MCP Disconnected'}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
          Your AI-powered trading coach and analytics assistant
        </Typography>
      </Box>
      
      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<ChatIcon />} label="Chat" />
        <Tab icon={<InsightsIcon />} label="Insights" />
        <Tab icon={<AssessmentIcon />} label="Trading Patterns" />
        <Tab icon={<SupportAgentIcon />} label="Assistant Settings" />
      </Tabs>
      
      {/* Tab Panels */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
        {/* Chat Panel */}
        {activeTab === 0 && (
          <Box sx={{ height: '100%' }}>
            <AIChat />
          </Box>
        )}
        
        {/* Insights Panel */}
        {activeTab === 1 && (
          <Box sx={{ p: 0 }}>
            <TradeSageInsights />
          </Box>
        )}
        
        {/* Trading Patterns Panel */}
        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Trading Patterns Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              TradeSage analyzes your trading data to identify patterns that lead to success or failure.
            </Typography>
            
            <TradeInsights showGeneral={true} />
          </Box>
        )}
        
        {/* Assistant Settings Panel */}
        {activeTab === 3 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              TradeSage Assistant Settings
            </Typography>
            
            {/* MCP Connection */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1">Model Context Protocol</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enhanced AI capabilities through MCP technology
                  </Typography>
                </Box>
                
                <Button 
                  variant={mcpConnected ? "outlined" : "contained"}
                  color={mcpConnected ? "error" : "success"}
                  onClick={toggleMcpConnection}
                >
                  {mcpConnected ? "Disconnect" : "Connect"} MCP
                </Button>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2">
                Status: {mcpStatus}
              </Typography>
              
              {!mcpConnected && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Connecting to MCP enables advanced AI capabilities like trading pattern recognition, personalized recommendations, and more detailed insights.
                </Alert>
              )}
            </Paper>
            
            {/* Personality Settings */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1">Assistant Personality</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Customize how TradeSage interacts with you
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Communication Style:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small">Direct</Button>
                  <Button variant="contained" size="small" color="primary">Balanced</Button>
                  <Button variant="outlined" size="small">Detailed</Button>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Analytical Depth:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small">Basic</Button>
                  <Button variant="contained" size="small" color="primary">Standard</Button>
                  <Button variant="outlined" size="small">Advanced</Button>
                </Box>
              </Box>
            </Paper>
            
            {/* Data Integration */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1">Data Integration</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Control what data TradeSage can access
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  startIcon={<SettingsIcon />}
                >
                  Configure Data Access
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TradeSageInterface;
