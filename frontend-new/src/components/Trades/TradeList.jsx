import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Collapse,
  Divider
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  TrendingUp as ProfitIcon, 
  TrendingDown as LossIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFirebase } from '../../contexts/FirebaseContext'; // Import Firebase context hook
import { useSnackbar } from '../../contexts/SnackbarContext';
import { format } from 'date-fns';

// Define setup types based on MMXM/ICT concepts
const setupTypes = [
  'All',
  'FVG Fill',
  'BPR',
  'OTE',
  'PD Level',
  'Liquidity Grab',
  'Order Block',
  'Smart Money Concept',
  'Double Top/Bottom',
  'Fibonacci Retracement',
  'EQH/EQL',
  'Other'
];

// Helper function to safely convert Firestore timestamps or strings to Date objects
const safelyParseDate = (timeValue) => {
  if (!timeValue) return new Date(); // Fallback to current date
  
  try {
    // Handle Firestore timestamp objects
    if (timeValue && typeof timeValue === 'object' && 'seconds' in timeValue && 'nanoseconds' in timeValue) {
      return new Date(timeValue.seconds * 1000 + timeValue.nanoseconds / 1000000);
    }
    
    // Handle ISO strings or other date formats
    return new Date(timeValue);
  } catch (error) {
    console.error('Error parsing date:', timeValue, error);
    return new Date(); // Fallback to current date
  }
};

const TradeList = ({ onEdit, onAdd, onDelete, refreshTrigger }) => {
  const { showSnackbar } = useSnackbar();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  
  // Get Firebase operations from context
  const firebase = useFirebase();
  
  // Filter states
  const [filters, setFilters] = useState({
    symbol: '',
    setupType: 'All',
    outcome: 'All',
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    console.log("TradeList: Using Firebase context");
    fetchTrades();
  }, [refreshTrigger]); // Refresh when triggered externally

  const fetchTrades = async () => {
    setLoading(true);
    try {
      console.log('TradeList: Fetching trades with filters:', filters);
      
      // Prepare API parameters
      const params = {};
      if (filters.symbol) params.symbol = filters.symbol;
      if (filters.setupType !== 'All') params.setupType = filters.setupType;
      if (filters.outcome !== 'All') params.outcome = filters.outcome;
      if (filters.startDate) params.startDate = format(filters.startDate, 'yyyy-MM-dd');
      if (filters.endDate) params.endDate = format(filters.endDate, 'yyyy-MM-dd');
      
      const data = await firebase.getAllTrades(params);
      console.log('TradeList: Fetched trades:', data);
      setTrades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching trades:', error);
      showSnackbar('Failed to load trades: ' + (error.message || 'Unknown error'), 'error');
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    setPage(0); // Reset to first page
    fetchTrades();
  };

  const handleResetFilters = () => {
    setFilters({
      symbol: '',
      setupType: 'All',
      outcome: 'All',
      startDate: null,
      endDate: null
    });
    setPage(0);
    // Fetch without filters
    fetchTrades();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
      try {
        console.log('TradeList: Deleting trade with ID:', id);
        await firebase.deleteTrade(id);
        setTrades(trades.filter(trade => trade.id !== id));
        showSnackbar('Trade deleted successfully', 'success');
        if (onDelete) onDelete(id);
      } catch (error) {
        console.error('Error deleting trade:', error);
        showSnackbar('Failed to delete trade: ' + (error.message || 'Unknown error'), 'error');
      }
    }
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Trade Journal
        </Typography>
        <Box>
          <Button 
            startIcon={<FilterIcon />} 
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 1 }}
          >
            Filters
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onAdd}
          >
            Add Trade
          </Button>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Filters Section */}
      <Collapse in={showFilters}>
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Symbol"
                fullWidth
                value={filters.symbol}
                onChange={(e) => handleFilterChange('symbol', e.target.value)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Setup Type</InputLabel>
                <Select
                  value={filters.setupType}
                  onChange={(e) => handleFilterChange('setupType', e.target.value)}
                  label="Setup Type"
                >
                  {setupTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Outcome</InputLabel>
                <Select
                  value={filters.outcome}
                  onChange={(e) => handleFilterChange('outcome', e.target.value)}
                  label="Outcome"
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Win">Win</MenuItem>
                  <MenuItem value="Loss">Loss</MenuItem>
                  <MenuItem value="Breakeven">Breakeven</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={filters.startDate}
                  onChange={(newValue) => handleFilterChange('startDate', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="To Date"
                  value={filters.endDate}
                  onChange={(newValue) => handleFilterChange('endDate', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="contained" 
                  onClick={handleApplyFilters}
                  size="small"
                >
                  Apply
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleResetFilters}
                  size="small"
                  startIcon={<RefreshIcon />}
                >
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        <Divider />
      </Collapse>
      
      {/* Trades Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : trades.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No trades found. Try adjusting your filters or add a new trade.
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Setup</TableCell>
                  <TableCell>Entry/Exit</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell align="right">P/L</TableCell>
                  <TableCell>R:R</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trades
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((trade) => (
                    <TableRow hover key={trade.id}>
                      <TableCell>
                        {format(safelyParseDate(trade.entry_time), 'MMM dd, yyyy')}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {format(safelyParseDate(trade.entry_time), 'HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>{trade.symbol}</TableCell>
                      <TableCell>{trade.setup_type}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {trade.entry_price} → {trade.exit_price}
                        </Typography>
                      </TableCell>
                      <TableCell>{trade.position_size}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {trade.profit_loss > 0 ? (
                            <ProfitIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                          ) : trade.profit_loss < 0 ? (
                            <LossIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                          ) : null}
                          <Typography
                            variant="body2"
                            color={
                              trade.profit_loss > 0
                                ? 'success.main'
                                : trade.profit_loss < 0
                                ? 'error.main'
                                : 'text.primary'
                            }
                          >
                            {trade.profit_loss > 0 ? '+' : ''}
                            {trade.profit_loss}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          P: {trade.planned_risk_reward || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          A: {trade.actual_risk_reward || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={trade.outcome}
                          color={
                            trade.outcome === 'Win'
                              ? 'success'
                              : trade.outcome === 'Loss'
                              ? 'error'
                              : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 150 }}>
                          {trade.tags && trade.tags.length > 0 ? 
                            trade.tags.slice(0, 2).map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            )) 
                          : (
                            <Typography variant="caption" color="text.secondary">
                              No tags
                            </Typography>
                          )}
                          {trade.tags && trade.tags.length > 2 && (
                            <Chip 
                              label={`+${trade.tags.length - 2}`} 
                              size="small" 
                              variant="outlined" 
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(trade)}
                            aria-label="edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(trade.id)}
                            aria-label="delete"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={trades.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Paper>
  );
};

export default TradeList;