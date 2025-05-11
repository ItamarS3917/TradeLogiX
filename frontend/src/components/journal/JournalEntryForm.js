import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  Rating,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import { useAuth } from '../../context/AuthContext';
import JournalService from '../../services/journal_service';
import TradeService from '../../services/trade_service';

// Custom styled rating component
const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconEmpty': {
    color: theme.palette.action.disabled
  }
}));

// Mood labels for rating
const moodLabels = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Neutral',
  4: 'Good',
  5: 'Excellent'
};

// Get mood icon based on rating
const getMoodIcon = (rating) => {
  if (rating <= 2) return <SentimentVeryDissatisfiedIcon />;
  if (rating <= 3) return <SentimentNeutralIcon />;
  return <EmojiEmotionsIcon />;
};

/**
 * Journal Entry Form Component
 * 
 * Allows users to create or edit journal entries for their trading day
 * 
 * @param {Object} props - Component props
 * @param {Object} props.journalEntry - Existing journal entry for editing (optional)
 * @param {Function} props.onSave - Callback function after saving
 * @param {Function} props.onCancel - Callback function to cancel
 */
const JournalEntryForm = ({ journalEntry, onSave, onCancel }) => {
  const { user } = useAuth();
  const isEditing = Boolean(journalEntry?.id);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    mood_rating: 3,
    tags: [],
    related_trade_ids: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState([
    'Morning Session', 'Afternoon Session', 'Market Analysis', 'Psychology', 
    'Goals', 'Reflection', 'Plan', 'Strategy', 'Lessons Learned'
  ]);
  const [availableTrades, setAvailableTrades] = useState([]);

  // Load journal entry data if editing
  useEffect(() => {
    if (journalEntry) {
      setFormData({
        date: journalEntry.date || new Date().toISOString().split('T')[0],
        title: journalEntry.title || '',
        content: journalEntry.content || '',
        mood_rating: journalEntry.mood_rating || 3,
        tags: journalEntry.tags || [],
        related_trade_ids: journalEntry.related_trade_ids || []
      });
    }
    
    // Load available trades for the selected date
    loadAvailableTrades();
  }, [journalEntry]);

  // Load available trades
  const loadAvailableTrades = async () => {
    try {
      // Get today's trades or trades for selected date
      const date = formData.date || new Date().toISOString().split('T')[0];
      const trades = await TradeService.getTradesByDate(user?.id, date);
      
      setAvailableTrades(trades.map(trade => ({
        id: trade.id,
        label: `${trade.symbol} ${trade.setup_type} (${trade.outcome}) - $${trade.profit_loss.toFixed(2)}`,
        ...trade
      })));
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // If date changes, reload available trades
    if (name === 'date') {
      loadAvailableTrades();
    }
  };

  // Handle mood rating change
  const handleMoodChange = (event, newValue) => {
    setFormData({
      ...formData,
      mood_rating: newValue
    });
  };

  // Handle tag input change
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Add a tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      
      // Add to available tags if not already present
      if (!availableTags.includes(tagInput.trim())) {
        setAvailableTags([...availableTags, tagInput.trim()]);
      }
      
      setTagInput('');
    }
    setTagDialogOpen(false);
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handle related trades change
  const handleTradesChange = (event, newValue) => {
    setFormData({
      ...formData,
      related_trade_ids: newValue.map(trade => trade.id)
    });
  };

  // Save journal entry
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Basic validation
      if (!formData.date) {
        throw new Error('Date is required');
      }
      
      if (!formData.content.trim()) {
        throw new Error('Journal content is required');
      }
      
      // Prepare data for API
      const journalData = {
        ...formData,
        user_id: user?.id || 1
      };
      
      // Create or update journal entry
      if (isEditing) {
        await JournalService.updateJournal(journalEntry.id, journalData);
      } else {
        await JournalService.createJournal(journalData);
      }
      
      setSuccess(true);
      
      // Call onSave callback
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error('Error saving journal entry:', err);
      setError(err.message || 'Failed to save journal entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Journal entry saved successfully!
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Date & Title */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Title (Optional)"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Daily Trading Reflection"
          />
        </Grid>
        
        {/* Mood Rating */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography component="legend" sx={{ mr: 2 }}>
              Mood Rating:
            </Typography>
            <StyledRating
              name="mood_rating"
              value={formData.mood_rating}
              onChange={handleMoodChange}
              icon={getMoodIcon(formData.mood_rating)}
              emptyIcon={getMoodIcon(formData.mood_rating)}
              max={5}
            />
            <Typography sx={{ ml: 2 }}>
              {moodLabels[formData.mood_rating] || 'Neutral'}
            </Typography>
          </Box>
        </Grid>
        
        {/* Journal Content */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={12}
            label="Journal Entry"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Reflect on your trading day, market conditions, emotions, lessons learned, etc."
          />
        </Grid>
        
        {/* Related Trades */}
        <Grid item xs={12}>
          <Autocomplete
            multiple
            options={availableTrades}
            getOptionLabel={(option) => option.label || ''}
            onChange={handleTradesChange}
            defaultValue={[]}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Related Trades"
                placeholder="Select trades"
              />
            )}
          />
        </Grid>
        
        {/* Tags */}
        <Grid item xs={12}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Tags:</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
            
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => setTagDialogOpen(true)}
              sx={{ borderRadius: '50%', border: '1px dashed', ml: 1 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Grid>
        
        {/* Action Buttons */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          {onCancel && (
            <Button 
              variant="outlined" 
              onClick={onCancel}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            {isEditing ? 'Update' : 'Save'} Journal Entry
          </Button>
        </Grid>
      </Grid>
      
      {/* Tag Dialog */}
      <Dialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)}>
        <DialogTitle>Add a Tag</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <Autocomplete
              freeSolo
              options={availableTags}
              inputValue={tagInput}
              onInputChange={(event, newValue) => {
                setTagInput(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tag"
                  fullWidth
                  placeholder="Enter or select a tag"
                />
              )}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTagDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTag} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default JournalEntryForm;
