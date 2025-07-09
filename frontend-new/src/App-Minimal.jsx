import React from 'react';
import { CssBaseline, Box, Typography, Button, Container } from '@mui/material';

// Minimal App to test if the basic structure works
function App() {
  console.log('🚀 App component is rendering');
  
  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box 
          sx={{ 
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            🎯 Trading Journal
          </Typography>
          
          <Typography variant="h5" color="text.secondary" gutterBottom>
            ✅ React is working!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            ✅ Material-UI is working!<br/>
            ✅ App component is rendering!<br/>
            ✅ CSS is loading!
          </Typography>
          
          <Button 
            variant="contained" 
            size="large"
            onClick={() => alert('JavaScript is working!')}
          >
            Test JavaScript
          </Button>
          
          <Box sx={{ mt: 4, p: 3, bgcolor: 'success.light', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              🎉 Basic Setup is Working!
            </Typography>
            <Typography variant="body2">
              The app is loading successfully. Now we can add back the complex features one by one.
            </Typography>
          </Box>
          
          <Box sx={{ mt: 2, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              🔧 Next Steps:
            </Typography>
            <Typography variant="body2" component="div">
              <ol>
                <li>Check browser console for any errors</li>
                <li>Add back Router and see if it still works</li>
                <li>Add back Context providers one by one</li>
                <li>Add back page components</li>
              </ol>
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default App;