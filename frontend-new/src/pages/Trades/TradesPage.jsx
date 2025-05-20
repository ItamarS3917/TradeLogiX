import React, { useState, useEffect } from 'react';
import { Box, Container, Dialog, DialogContent, Typography, Fab, DialogTitle, IconButton } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { TradeForm, TradeList, TradeDetailDrawer } from '../../components/Trades';
import { useFirebase } from '../../contexts/FirebaseContext'; // Import Firebase context hook
import { useSnackbar } from '../../contexts/SnackbarContext';

const TradesPage = () => {
  const { showSnackbar } = useSnackbar();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Get Firebase operations from context
  const firebase = useFirebase();
  
  useEffect(() => {
    console.log("TradesPage initialized, using Firebase context");
  }, []);

  // Handle opening the trade form for adding a new trade
  const handleAddTrade = () => {
    setSelectedTrade(null);
    setIsEditing(false);
    setFormDialogOpen(true);
  };

  // Handle opening the trade form for editing an existing trade
  const handleEditTrade = (trade) => {
    setSelectedTrade(trade);
    setIsEditing(true);
    setFormDialogOpen(true);
  };

  // Handle view detailed trade information
  const handleViewTrade = (trade) => {
    setSelectedTrade(trade);
    setDetailDrawerOpen(true);
  };

  // Handle form submission (both for creating and updating)
  const handleSubmitTrade = async (data) => {
    setLoading(true);
    try {
      console.log('Saving trade data:', data);
      
      if (isEditing) {
        console.log('Updating trade with ID:', selectedTrade.id);
        await firebase.updateTrade(selectedTrade.id, data);
        showSnackbar('Trade updated successfully', 'success');
      } else {
        console.log('Creating new trade');
        const result = await firebase.createTrade(data);
        console.log('Create trade result:', result);
        showSnackbar('Trade added successfully', 'success');
      }
      setFormDialogOpen(false);
      // Trigger refresh of the trade list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error saving trade:', error);
      showSnackbar('Failed to save trade: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a trade
  const handleDeleteTrade = async (id) => {
    try {
      await firebase.deleteTrade(id);
      showSnackbar('Trade deleted successfully', 'success');
      // Trigger refresh of the trade list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting trade:', error);
      showSnackbar('Failed to delete trade: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trade Journal
        </Typography>
        
        {/* Trade List */}
        <TradeList 
          onEdit={handleViewTrade} 
          onAdd={handleAddTrade} 
          onDelete={handleDeleteTrade} 
          refreshTrigger={refreshTrigger}
        />
        
        {/* Floating Add Button (Mobile-friendly) */}
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleAddTrade}
        >
          <AddIcon />
        </Fab>
        
        {/* Trade Form Dialog */}
        <Dialog 
          open={formDialogOpen} 
          onClose={() => setFormDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {isEditing ? 'Edit Trade' : 'Add New Trade'}
              </Typography>
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={() => setFormDialogOpen(false)} 
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <TradeForm 
              initialData={selectedTrade} 
              onSubmit={handleSubmitTrade} 
              isLoading={loading}
            />
          </DialogContent>
        </Dialog>
        
        {/* Trade Detail Drawer */}
        <TradeDetailDrawer 
          trade={selectedTrade}
          open={detailDrawerOpen}
          onClose={() => setDetailDrawerOpen(false)}
          onEdit={handleEditTrade}
          onDelete={handleDeleteTrade}
        />
      </Box>
    </Container>
  );
};

export default TradesPage;