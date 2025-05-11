import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Divider,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, addMonths, subMonths, isWithinInterval, parseISO } from 'date-fns';
import planningService from '../../services/planningService';
import { useSnackbar } from '../../contexts/SnackbarContext';

const PlanningCalendar = ({ onSelectDate, onViewPlan, onEditPlan, onAddPlan, refreshTrigger }) => {
  const { showSnackbar } = useSnackbar();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  useEffect(() => {
    fetchPlans();
  }, [currentMonth, refreshTrigger]);
  
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const data = await planningService.getAllDailyPlans({
        start_date: start,
        end_date: end
      });
      
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      showSnackbar('Failed to load plans', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      try {
        await planningService.deleteDailyPlan(id);
        showSnackbar('Plan deleted successfully', 'success');
        fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
        showSnackbar('Failed to delete plan', 'error');
      }
    }
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  
  // Get all days in current month
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  // Group days into weeks
  const weeks = [];
  let week = [];
  
  monthDays.forEach((day, index) => {
    if (index % 7 === 0 && index !== 0) {
      weeks.push(week);
      week = [];
    }
    week.push(day);
    
    // Add the last week
    if (index === monthDays.length - 1) {
      weeks.push(week);
    }
  });
  
  // Check if a plan exists for a specific date
  const getPlanForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return plans.find(plan => {
      const planDate = format(new Date(plan.date), 'yyyy-MM-dd');
      return planDate === dateStr;
    });
  };
  
  return (
    <Paper elevation={3} sx={{ mb: 4 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Planning Calendar
        </Typography>
        <Box>
          <Button onClick={goToToday} variant="outlined" size="small" sx={{ mr: 1 }}>
            Today
          </Button>
          <IconButton onClick={prevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={nextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6">
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <TableCell key={day} align="center">
                    <Typography variant="subtitle2">{day}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, weekIndex) => (
                <TableRow key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const plan = getPlanForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    
                    return (
                      <TableCell 
                        key={dayIndex} 
                        align="center" 
                        sx={{ 
                          height: 100,
                          padding: 1,
                          borderRight: dayIndex < 6 ? '1px solid #eee' : 'none',
                          backgroundColor: isToday(day) ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                          opacity: isCurrentMonth ? 1 : 0.3,
                          position: 'relative',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          }
                        }}
                        onClick={() => onSelectDate(day)}
                      >
                        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <Typography 
                            variant="body2" 
                            fontWeight={isToday(day) ? 'bold' : 'normal'}
                          >
                            {format(day, 'd')}
                          </Typography>
                          {isCurrentMonth && !plan && (
                            <Tooltip title="Add Plan">
                              <IconButton 
                                size="small" 
                                color="primary" 
                                sx={{ padding: 0.2 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddPlan(day);
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                        
                        {plan && (
                          <Box>
                            <Chip 
                              label={plan.market_bias} 
                              size="small"
                              color={
                                plan.market_bias === 'Bullish' ? 'success' :
                                plan.market_bias === 'Bearish' ? 'error' :
                                'default'
                              }
                              sx={{ mb: 1, width: '100%' }}
                            />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                              <Tooltip title="View Plan">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewPlan(plan);
                                  }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Edit Plan">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditPlan(plan);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Delete Plan">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePlan(plan.id);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default PlanningCalendar;