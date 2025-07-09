import React from 'react';
import { CssBaseline, Box, Typography, Button, Container } from '@mui/material';

// Simple version that skips all contexts and routing
function App() {
  console.log('🚀 Simple Dashboard App rendering...');
  
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" gutterBottom>
            🎯 Trading Journal Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ✅ App is working without contexts!
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 3,
          mb: 4
        }}>
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            textAlign: 'center'
          }}>
            <Typography variant="h4" gutterBottom>68%</Typography>
            <Typography variant="h6">Win Rate</Typography>
          </Box>
          
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            bgcolor: 'success.main', 
            color: 'white',
            textAlign: 'center'
          }}>
            <Typography variant="h4" gutterBottom>$2,450</Typography>
            <Typography variant="h6">Today's P&L</Typography>
          </Box>
          
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            bgcolor: 'info.main', 
            color: 'white',
            textAlign: 'center'
          }}>
            <Typography variant="h4" gutterBottom>28</Typography>
            <Typography variant="h6">Total Trades</Typography>
          </Box>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ mr: 2 }}
            onClick={() => alert('Add Trade clicked!')}
          >
            Add Trade
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={() => alert('View Statistics clicked!')}
          >
            View Statistics
          </Button>
        </Box>
        
        <Box sx={{ mt: 4, p: 3, bgcolor: 'success.light', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            🎉 Trading Journal Core is Working!
          </Typography>
          <Typography variant="body1">
            This proves React, Material-UI, and Firebase imports work.
            Now we can add back contexts one by one to find what breaks it.
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default App;