import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Grid,
  Typography,
  IconButton,
  Badge,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  ArrowBackIos as PrevIcon,
  ArrowForwardIos as NextIcon,
  Info as InfoIcon,
  TrendingUp as BullishIcon,
  TrendingDown as BearishIcon,
  TrendingFlat as NeutralIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns';
import planningService from '../../services/planningService';
import { useSnackbar } from '../../contexts/SnackbarContext';

// Helper function to convert market bias to icon
const getBiasIcon = (bias) => {
  if (!bias) return null;
  
  const biasLower = bias.toLowerCase();
  
  if (biasLower.includes('bull')) {
    return <BullishIcon fontSize="small" color="success" />;
  } else if (biasLower.includes('bear')) {
    return <BearishIcon fontSize="small" color="error" />;
  } else {
    return <NeutralIcon fontSize="small" color="action" />;
  }
};

const PlanCalendar = ({ onSelectDate, selectedDate }) => {
  const { showSnackbar } = useSnackbar();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [monthPlans, setMonthPlans] = useState([]);
  
  useEffect(() => {
    fetchMonthPlans();
  }, [currentMonth]);
  
  // Fetch plans for the current month
  const fetchMonthPlans = async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const plans = await planningService.getAllDailyPlans({
        start_date: start,
        end_date: end
      });
      
      setMonthPlans(plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      showSnackbar('Failed to load plans for this month', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle month navigation
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
    onSelectDate(new Date());
  };
  
  // Get days of the week headers (Sunday to Saturday)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = monthStart;
  const endDate = monthEnd;
  
  const dayStartingIndex = getDay(startDate); // 0 for Sunday
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Create array for calendar grid (with leading empty cells for proper alignment)
  const calendarDays = Array(dayStartingIndex).fill(null).concat(daysInMonth);
  
  // Split the days into weeks (rows)
  const weeks = [];
  let week = [];
  
  calendarDays.forEach((day, index) => {
    week.push(day);
    
    if (index % 7 === 6 || index === calendarDays.length - 1) {
      // Fill remaining days of the week if needed
      if (week.length < 7) {
        week = [...week, ...Array(7 - week.length).fill(null)];
      }
      weeks.push(week);
      week = [];
    }
  });
  
  // Determine if a day has a plan
  const hasPlan = (day) => {
    if (!day) return false;
    return monthPlans.some(plan => isSameDay(new Date(plan.date), day));
  };
  
  // Get plan details for a specific day
  const getPlanForDay = (day) => {
    if (!day) return null;
    return monthPlans.find(plan => isSameDay(new Date(plan.date), day));
  };
  
  // Render calendar cell for a day
  const renderDay = (day) => {
    if (!day) return <Box sx={{ height: 70 }} />; // Empty cell
    
    const plan = getPlanForDay(day);
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    
    return (
      <Box
        onClick={() => onSelectDate(day)}
        sx={{
          height: 70,
          p: 1,
          border: isSelected ? '2px solid' : '1px solid',
          borderColor: isSelected ? 'primary.main' : 'divider',
          borderRadius: 1,
          bgcolor: isSelected ? 'primary.light' : isCurrentMonth ? 'background.paper' : 'action.hover',
          opacity: isCurrentMonth ? 1 : 0.5,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
            boxShadow: 1
          },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: isCurrentMonth ? 'bold' : 'normal',
            color: isSelected ? 'primary.contrastText' : 'text.primary'
          }}
        >
          {format(day, 'd')}
        </Typography>
        
        {plan && (
          <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {getBiasIcon(plan.market_bias)}
            <Badge color="primary" variant="dot" invisible={!hasPlan(day)}>
              <InfoIcon fontSize="small" sx={{ opacity: 0.7 }} />
            </Badge>
          </Box>
        )}
      </Box>
    );
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Trading Calendar
        </Typography>
        <Box>
          <IconButton onClick={goToToday} size="small" sx={{ mr: 1 }}>
            <TodayIcon />
          </IconButton>
          <IconButton onClick={prevMonth} size="small">
            <PrevIcon />
          </IconButton>
          <IconButton onClick={nextMonth} size="small">
            <NextIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
        {format(currentMonth, 'MMMM yyyy')}
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Days of week headers */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {daysOfWeek.map(day => (
              <Grid item xs key={day}>
                <Typography variant="subtitle2" align="center">
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>
          
          {/* Calendar grid */}
          {weeks.map((week, weekIndex) => (
            <Grid container spacing={1} key={weekIndex} sx={{ mb: 1 }}>
              {week.map((day, dayIndex) => (
                <Grid item xs key={dayIndex}>
                  {renderDay(day)}
                </Grid>
              ))}
            </Grid>
          ))}
          
          {/* Legend */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Chip
              icon={<BullishIcon fontSize="small" />}
              label="Bullish"
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<BearishIcon fontSize="small" />}
              label="Bearish"
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<NeutralIcon fontSize="small" />}
              label="Neutral"
              size="small"
              variant="outlined"
            />
          </Box>
        </>
      )}
    </Paper>
  );
};

export default PlanCalendar;