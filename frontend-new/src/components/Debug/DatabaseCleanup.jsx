import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Button, Alert, Divider, CircularProgress
} from '@mui/material';
import { 
  collection, getDocs, doc, deleteDoc, 
  query, where, orderBy, limit
} from '../../config/firebase';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useSnackbar } from '../../contexts/SnackbarContext';

/**
 * DatabaseCleanup component
 * A utility to clear Firebase data and start fresh
 */
const DatabaseCleanup = () => {
  const { db } = useFirebase();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  // Clear a specific collection
  const clearCollection = async (collectionName) => {
    setLoading(true);
    try {
      // Get all documents from the collection
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      // Track the number of documents
      let totalDocs = querySnapshot.size;
      let deletedDocs = 0;
      
      console.log(`Found ${totalDocs} documents in ${collectionName} collection`);
      
      // Delete each document
      const deletePromises = [];
      querySnapshot.forEach((document) => {
        console.log(`Deleting document ${document.id} from ${collectionName}`);
        deletePromises.push(
          deleteDoc(doc(db, collectionName, document.id))
            .then(() => {
              deletedDocs++;
              return true;
            })
            .catch(error => {
              console.error(`Error deleting ${document.id}:`, error);
              return false;
            })
        );
      });
      
      // Wait for all deletions to complete
      await Promise.all(deletePromises);
      
      // Update results
      setResults(prev => ({
        ...prev,
        [collectionName]: {
          total: totalDocs,
          deleted: deletedDocs,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      
      showSnackbar(`Successfully cleared ${deletedDocs} documents from ${collectionName}`, 'success');
    } catch (error) {
      console.error(`Error clearing ${collectionName}:`, error);
      showSnackbar(`Error clearing ${collectionName}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Clear all collections
  const clearAllCollections = async () => {
    if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
      setLoading(true);
      try {
        // List of collections to clear
        const collections = ['trades', 'daily_plans', 'journals'];
        
        // Clear each collection sequentially
        for (const collectionName of collections) {
          await clearCollection(collectionName);
        }
        
        showSnackbar('Database cleanup complete! You can now add new data.', 'success');
      } catch (error) {
        console.error('Error in clearAllCollections:', error);
        showSnackbar(`Error clearing collections: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Database Cleanup Utility
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="bold">
          Warning: This utility will permanently delete data from your Firebase database.
        </Typography>
        <Typography variant="body2">
          Use this only if you want to start fresh. This action cannot be undone.
        </Typography>
      </Alert>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Clear Specific Collections
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => clearCollection('trades')}
              disabled={loading}
            >
              Clear Trades
            </Button>
            
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => clearCollection('daily_plans')}
              disabled={loading}
            >
              Clear Daily Plans
            </Button>
            
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => clearCollection('journals')}
              disabled={loading}
            >
              Clear Journals
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Typography variant="h6" gutterBottom>
            Clear All Data
          </Typography>
          
          <Button 
            variant="contained" 
            color="error" 
            fullWidth
            onClick={clearAllCollections}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Clear All Firebase Data'}
          </Button>
        </Box>
      </Paper>
      
      {Object.keys(results).length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cleanup Results
          </Typography>
          
          {Object.entries(results).map(([collection, data]) => (
            <Box key={collection} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                {collection}: {data.deleted} of {data.total} documents deleted
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed at {data.timestamp}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default DatabaseCleanup;