import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Fab,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
// Import components directly rather than through index.js
import DailyPlanForm from '../../components/Planning/DailyPlanForm';
import PlanCalendar from '../../components/Planning/PlanCalendar';
import PlanDetail from '../../components/Planning/PlanDetail';
import planningService from '../../services/planningService';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { format, isSameDay } from 'date-fns';

const PlanningPage = () => {
  const { showSnackbar } = useSnackbar();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [todaysPlan, setTodaysPlan] = useState(null);
  
  useEffect(() => {
    checkTodaysPlan();
    if (selectedDate) {
      fetchPlanForDate(selectedDate);
    }
  }, [selectedDate]);
  
  // Check if there's a plan for today
  const checkTodaysPlan = async () => {
    try {
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      const plan = await planningService.getDailyPlanByDate(formattedDate);
      setTodaysPlan(plan);
    } catch (error) {
      // If 404, no plan exists which is fine
      if (error.response && error.response.status !== 404) {
        console.error('Error checking today\'s plan:', error);
      }
    }
  };
  
  // Fetch plan for selected date
  const fetchPlanForDate = async (date) => {
    setPlanLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const plan = await planningService.getDailyPlanByDate(formattedDate);
      setSelectedPlan(plan);
    } catch (error) {
      // If 404, no plan exists which is fine
      if (error.response && error.response.status !== 404) {
        console.error('Error fetching plan:', error);
        showSnackbar('Failed to load plan for this date', 'error');
      } else {
        setSelectedPlan(null);
      }
    } finally {
      setPlanLoading(false);
    }
  };
  
  // Handle date selection from calendar
  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };
  
  // Handle opening the form for a new plan
  const handleAddPlan = () => {
    setIsEditing(false);
    // Pre-set the selected date
    const initialData = {
      date: selectedDate
    };
    setSelectedPlan(initialData);
    setFormDialogOpen(true);
  };
  
  // Handle opening the form for editing an existing plan
  const handleEditPlan = (plan) => {
    setIsEditing(true);
    setSelectedPlan(plan);
    setFormDialogOpen(true);
  };
  
  // Handle form submission (both for creating and updating)
  const handleSubmitPlan = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await planningService.updateDailyPlan(selectedPlan.id, data);
        showSnackbar('Plan updated successfully', 'success');
      } else {
        await planningService.createDailyPlan(data);
        showSnackbar('Plan created successfully', 'success');
      }
      setFormDialogOpen(false);
      
      // Refresh plan data
      fetchPlanForDate(data.date);
      checkTodaysPlan();
    } catch (error) {
      console.error('Error saving plan:', error);
      showSnackbar('Failed to save plan', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting a plan
  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      try {
        await planningService.deleteDailyPlan(id);
        showSnackbar('Plan deleted successfully', 'success');
        setSelectedPlan(null);
        checkTodaysPlan();
      } catch (error) {
        console.error('Error deleting plan:', error);
        showSnackbar('Failed to delete plan', 'error');
      }
    }
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Daily Planning
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPlan}
          >
            Create Plan
          </Button>
        </Box>
        
        {/* Today's Plan Alert */}
        {isSameDay(selectedDate, new Date()) && !selectedPlan && (
          <Alert 
            severity="info" 
            action={
              <Button color="inherit" size="small" onClick={handleAddPlan}>
                CREATE NOW
              </Button>
            }
            sx={{ mb: 3 }}
          >
            You haven't created a trading plan for today yet. Planning your trading day is essential for maintaining discipline.
          </Alert>
        )}
        
        <Grid container spacing={4}>
          {/* Calendar */}
          <Grid item xs={12} md={5}>
            <PlanCalendar 
              onSelectDate={handleSelectDate} 
              selectedDate={selectedDate}
            />
          </Grid>
          
          {/* Plan Detail */}
          <Grid item xs={12} md={7}>
            <PlanDetail 
              plan={selectedPlan}
              loading={planLoading}
              onEdit={handleEditPlan}
              onDelete={handleDeletePlan}
            />
          </Grid>
        </Grid>
        
        {/* Floating Add Button (Mobile) */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16, display: { md: 'none' } }}
          onClick={handleAddPlan}
        >
          <AddIcon />
        </Fab>
        
        {/* Form Dialog */}
        <Dialog
          open={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {isEditing ? 'Edit Trading Plan' : 'Create New Trading Plan'}
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
            <DailyPlanForm
              initialData={selectedPlan}
              onSubmit={handleSubmitPlan}
              isLoading={loading}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PlanningPage;