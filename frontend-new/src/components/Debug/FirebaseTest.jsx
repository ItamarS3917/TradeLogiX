import React, { useEffect, useState } from 'react';
import { 
  db, collection, getDocs, doc, getDoc, query, where, orderBy, limit 
} from '../../config/firebase';
import { 
  Box, Typography, Paper, Button, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, Alert
} from '@mui/material';

/**
 * FirebaseTest component
 * A diagnostic component that directly queries Firebase to troubleshoot data retrieval issues
 */
const FirebaseTest = () => {
  const [tradesData, setTradesData] = useState({ loading: true, data: [], error: null });
  const [plansData, setPlansData] = useState({ loading: true, data: [], error: null });
  const [directDocData, setDirectDocData] = useState({ loading: false, data: null, error: null });

  // Test direct collection access
  useEffect(() => {
    const fetchTradesDirectly = async () => {
      try {
        console.log("DIAGNOSTIC: Attempting to fetch trades directly from Firebase");
        console.log("DIAGNOSTIC: DB reference:", db);
        
        const tradesCollection = collection(db, 'trades');
        console.log("DIAGNOSTIC: Collection reference:", tradesCollection);
        
        // First try without any filters
        const querySnapshot = await getDocs(tradesCollection);
        
        console.log("DIAGNOSTIC: Query snapshot size:", querySnapshot.size);
        console.log("DIAGNOSTIC: Query snapshot empty:", querySnapshot.empty);
        
        const tradesList = [];
        querySnapshot.forEach((doc) => {
          console.log("DIAGNOSTIC: Document found:", doc.id);
          console.log("DIAGNOSTIC: Document data:", doc.data());
          tradesList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setTradesData({
          loading: false,
          data: tradesList,
          error: null
        });
        
      } catch (err) {
        console.error("DIAGNOSTIC: Error fetching trades:", err);
        setTradesData({
          loading: false,
          data: [],
          error: err.message
        });
      }
    };

    const fetchPlansDirectly = async () => {
      try {
        console.log("DIAGNOSTIC: Attempting to fetch daily plans directly from Firebase");
        
        const plansCollection = collection(db, 'daily_plans');
        console.log("DIAGNOSTIC: Plans collection reference:", plansCollection);
        
        const querySnapshot = await getDocs(plansCollection);
        
        console.log("DIAGNOSTIC: Plans query snapshot size:", querySnapshot.size);
        console.log("DIAGNOSTIC: Plans query snapshot empty:", querySnapshot.empty);
        
        const plansList = [];
        querySnapshot.forEach((doc) => {
          console.log("DIAGNOSTIC: Plan document found:", doc.id);
          console.log("DIAGNOSTIC: Plan document data:", doc.data());
          plansList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setPlansData({
          loading: false,
          data: plansList,
          error: null
        });
        
      } catch (err) {
        console.error("DIAGNOSTIC: Error fetching plans:", err);
        setPlansData({
          loading: false,
          data: [],
          error: err.message
        });
      }
    };
    
    fetchTradesDirectly();
    fetchPlansDirectly();
  }, []);

  // Function to fetch a specific document by ID
  const fetchSpecificDocument = async (collectionName, documentId) => {
    setDirectDocData({ loading: true, data: null, error: null });
    
    try {
      console.log(`DIAGNOSTIC: Fetching specific document ${documentId} from ${collectionName}`);
      
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      console.log("DIAGNOSTIC: Document exists:", docSnap.exists());
      
      if (docSnap.exists()) {
        console.log("DIAGNOSTIC: Document data:", docSnap.data());
        setDirectDocData({
          loading: false,
          data: {
            id: docSnap.id,
            ...docSnap.data()
          },
          error: null
        });
      } else {
        console.log("DIAGNOSTIC: Document does not exist");
        setDirectDocData({
          loading: false,
          data: null,
          error: "Document not found"
        });
      }
    } catch (err) {
      console.error("DIAGNOSTIC: Error fetching document:", err);
      setDirectDocData({
        loading: false,
        data: null,
        error: err.message
      });
    }
  };

  // Test a query with filters
  const testQueryWithFilters = async () => {
    try {
      console.log("DIAGNOSTIC: Testing query with filters");
      
      const tradesCollection = collection(db, 'trades');
      
      // Try with a simple filter that should match most trades
      const q = query(
        tradesCollection,
        where('outcome', 'in', ['Win', 'Loss', 'Breakeven']),
        orderBy('created_at', 'desc'),
        limit(10)
      );
      
      console.log("DIAGNOSTIC: Filter query:", q);
      
      const querySnapshot = await getDocs(q);
      
      console.log("DIAGNOSTIC: Filtered query snapshot size:", querySnapshot.size);
      console.log("DIAGNOSTIC: Filtered query snapshot empty:", querySnapshot.empty);
      
      const filteredTrades = [];
      querySnapshot.forEach((doc) => {
        console.log("DIAGNOSTIC: Filtered document found:", doc.id);
        console.log("DIAGNOSTIC: Filtered document data:", doc.data());
        filteredTrades.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setTradesData({
        loading: false,
        data: filteredTrades,
        error: null
      });
      
    } catch (err) {
      console.error("DIAGNOSTIC: Error with filtered query:", err);
      setTradesData({
        loading: false,
        data: [],
        error: `Error with filtered query: ${err.message}`
      });
    }
  };

  // Format data for display
  const formatData = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return "Error formatting data";
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Firebase Diagnostic Tool
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This diagnostic tool directly queries Firebase to help troubleshoot data retrieval issues.
        Check your browser console for detailed logs.
      </Alert>
      
      {/* Trades Collection Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Trades Collection Test</Typography>
          <Button 
            variant="outlined"
            onClick={testQueryWithFilters}
            disabled={tradesData.loading}
          >
            Test With Filters
          </Button>
        </Box>
        
        {tradesData.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : tradesData.error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error: {tradesData.error}
          </Alert>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Found {tradesData.data.length} trades in Firebase
            </Typography>
            
            {tradesData.data.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Setup Type</TableCell>
                      <TableCell>Outcome</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tradesData.data.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell>{trade.id.substring(0, 8)}...</TableCell>
                        <TableCell>{trade.symbol || 'N/A'}</TableCell>
                        <TableCell>{trade.setup_type || 'N/A'}</TableCell>
                        <TableCell>{trade.outcome || 'N/A'}</TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            onClick={() => fetchSpecificDocument('trades', trade.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No trades found in Firestore. This could indicate a connection issue, empty collection, or incorrect collection name.
              </Alert>
            )}
          </>
        )}
      </Paper>
      
      {/* Daily Plans Collection Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Daily Plans Collection Test
        </Typography>
        
        {plansData.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : plansData.error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error: {plansData.error}
          </Alert>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Found {plansData.data.length} daily plans in Firebase
            </Typography>
            
            {plansData.data.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Market Bias</TableCell>
                      <TableCell>Mental State</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plansData.data.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>{plan.id.substring(0, 8)}...</TableCell>
                        <TableCell>{plan.date ? new Date(plan.date.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{plan.market_bias || 'N/A'}</TableCell>
                        <TableCell>{plan.mental_state || 'N/A'}</TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            onClick={() => fetchSpecificDocument('daily_plans', plan.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No daily plans found in Firestore. This could indicate a connection issue, empty collection, or incorrect collection name.
              </Alert>
            )}
          </>
        )}
      </Paper>
      
      {/* Document Detail Section */}
      {(directDocData.loading || directDocData.data || directDocData.error) && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Document Detail View
          </Typography>
          
          {directDocData.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : directDocData.error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error: {directDocData.error}
            </Alert>
          ) : directDocData.data && (
            <Box 
              sx={{ 
                maxHeight: 400, 
                overflowY: 'auto', 
                bgcolor: 'background.paper', 
                p: 2, 
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap'
              }}
            >
              {formatData(directDocData.data)}
            </Box>
          )}
        </Paper>
      )}
      
      {/* Firebase Configuration Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Database Connection Info
        </Typography>
        
        <Typography variant="body2" component="div" sx={{ mb: 1 }}>
          <strong>Firebase App:</strong> {db?.app?.name || 'Unknown'}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Project ID:</strong> {db?._projectId || 'Unknown'}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => {
            // Force refresh of both collections
            setTradesData({ loading: true, data: [], error: null });
            setPlansData({ loading: true, data: [], error: null });
            
            const fetchTradesDirectly = async () => {
              try {
                console.log("DIAGNOSTIC: Re-fetching trades");
                const tradesCollection = collection(db, 'trades');
                const querySnapshot = await getDocs(tradesCollection);
                
                const tradesList = [];
                querySnapshot.forEach((doc) => {
                  tradesList.push({
                    id: doc.id,
                    ...doc.data()
                  });
                });
                
                setTradesData({
                  loading: false,
                  data: tradesList,
                  error: null
                });
              } catch (err) {
                setTradesData({
                  loading: false,
                  data: [],
                  error: err.message
                });
              }
            };
            
            const fetchPlansDirectly = async () => {
              try {
                console.log("DIAGNOSTIC: Re-fetching plans");
                const plansCollection = collection(db, 'daily_plans');
                const querySnapshot = await getDocs(plansCollection);
                
                const plansList = [];
                querySnapshot.forEach((doc) => {
                  plansList.push({
                    id: doc.id,
                    ...doc.data()
                  });
                });
                
                setPlansData({
                  loading: false,
                  data: plansList,
                  error: null
                });
              } catch (err) {
                setPlansData({
                  loading: false,
                  data: [],
                  error: err.message
                });
              }
            };
            
            fetchTradesDirectly();
            fetchPlansDirectly();
          }}
        >
          Refresh All Data
        </Button>
      </Paper>
    </Box>
  );
};

export default FirebaseTest;
