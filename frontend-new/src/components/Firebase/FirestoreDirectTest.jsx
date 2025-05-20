// File: FirestoreDirectTest.jsx
// Purpose: Component to test direct Firestore connectivity

import React, { useState } from 'react';
import { Box, Button, Container, Typography, Paper, TextField } from '@mui/material';
import { db, collection, addDoc, getDocs } from '../../config/firebase';

const FirestoreDirectTest = () => {
  const [status, setStatus] = useState('');
  const [testValue, setTestValue] = useState('Test value ' + new Date().toLocaleTimeString());
  
  // Test creating a document directly
  const testAddDocument = async () => {
    try {
      setStatus('Testing direct Firestore connection...');
      
      // Create test data
      const testData = {
        message: testValue,
        timestamp: new Date(),
        type: 'direct-test'
      };
      
      // Add document directly to Firestore
      const docRef = await addDoc(collection(db, 'test'), testData);
      
      setStatus(`Success! Document added with ID: ${docRef.id}`);
    } catch (error) {
      console.error('Error in direct Firestore test:', error);
      setStatus(`Error: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Direct Firestore Connection Test
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" paragraph>
            This component tests connecting directly to Firestore without going through the service layer.
            It helps isolate whether the issue is with Firestore configuration or with the service implementation.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Test value"
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
              variant="outlined"
              margin="normal"
            />
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            onClick={testAddDocument}
            sx={{ mr: 2 }}
          >
            Add Document Directly
          </Button>
        </Paper>
        
        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom>
            Status
          </Typography>
          
          <Typography variant="body1" component="pre" sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            overflowX: 'auto'
          }}>
            {status || 'Ready to test'}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default FirestoreDirectTest;
