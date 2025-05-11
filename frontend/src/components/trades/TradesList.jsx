import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Image as ImageIcon,
  CalendarToday as CalendarTodayIcon,
  Add as AddIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

// Setup types mapping for display
const setupTypeMap = {
  'MMXM_STANDARD': 'MMXM Standard',
  'MMXM_ADVANCED': 'MMXM Advanced',
  'ICT_BPR': 'ICT Breaker/P&R',
  'ICT_OTE': 'ICT OTE',
  'ICT_HOD_LOD': 'ICT High/Low of Day',
  'LIQUIDITY_GRAB': 'Liquidity Grab',
  'FVFA': 'Fair Value/Fair Auction',
  'OTHER': 'Other',
};

// Outcome mapping for display and colors
const outcomeMap = {
  'WIN': { label: 'Win', color: 'success' },
  'LOSS': { label: 'Loss', color: 'error' },
  'BREAKEVEN': { label: 'Breakeven', color: 'warning' },
};

/**
 * Trades List Component
 * Displays a list of trades with filtering, sorting, and pagination
 */
const TradesList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState([]);
  const [totalTrades, setTotalTrades] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    symbol: '',
    setupType: '',
    outcome: '',
    minProfit: '',
    maxLoss: '',
    tag: '',
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [screenshotDialog, setScreenshotDialog] = useState({
    open: false,
    images: [],
    title: '',
  });

  // Fetch trades on component mount and when filters/pagination/sorting change
  useEffect(() => {
    fetchTrades();
  }, [page, rowsPerPage, orderBy, order, activeFilters]);

  // Fetch trades from API
  const fetchTrades = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = {
        page: page + 1, // API is 1-indexed, but Material UI is 0-indexed
        per_page: rowsPerPage,
        order_by: orderBy,
        order: order,
        ...activeFilters,
      };

      const response = await axios.get('/api/trades', { params });
      
      setTrades(response.data.items);
      setTotalTrades(response.data.total);
    } catch (error) {
      console.error('Error fetching trades:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load trades. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting change
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Apply filters
  const applyFilters = () => {
    // Remove empty filters
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});

    setActiveFilters(activeFilters);
    setFilterOpen(false);
    setPage(0); // Reset to first page
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      symbol: '',
      setupType: '',
      outcome: '',
      minProfit: '',
      maxLoss: '',
      tag: '',
    });
    setActiveFilters({});
    setFilterOpen(false);
  };

  // Format profit/loss with color
  const formatProfitLoss = (value) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

    if (value > 0) {
      return <Typography color="success.main">{formatted}</Typography>;
    } else if (value < 0) {
      return <Typography color="error.main">{formatted}</Typography>;
    }
    return <Typography color="text.secondary">{formatted}</Typography>;
  };

  // View trade details
  const viewTrade = (tradeId) => {
    navigate(`/trades/${tradeId}`);
  };

  // Edit trade
  const editTrade = (tradeId) => {
    navigate(`/trades/${tradeId}/edit`);
  };

  // Delete trade confirmation
  const confirmDelete = (tradeId) => {
    setSelectedTradeId(tradeId);
    setDeleteDialogOpen(true);
  };

  // Delete trade
  const deleteTrade = async () => {
    try {
      await axios.delete(`/api/trades/${selectedTradeId}`);
      setSnackbar({
        open: true,
        message: 'Trade deleted successfully',
        severity: 'success',
      });
      fetchTrades(); // Refresh the list
    } catch (error) {
      console.error('Error deleting trade:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete trade. Please try again.',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedTradeId(null);
    }
  };

  // View screenshots
  const viewScreenshots = (trade) => {
    // In a real application, you'd fetch the actual screenshot URLs from the backend
    const mockScreenshots = [
      { url: 'https://via.placeholder.com/800x500?text=Chart+Setup', title: 'Chart Setup' },
      { url: 'https://via.placeholder.com/800x500?text=Entry+Point', title: 'Entry Point' },
      { url: 'https://via.placeholder.com/800x500?text=Exit+Point', title: 'Exit Point' },
    ];

    setScreenshotDialog({
      open: true,
      images: mockScreenshots,
      title: `Screenshots for ${trade.symbol} trade on ${format(new Date(trade.date), 'MMM d, yyyy')}`,
    });
  };

  // Close screenshot dialog
  const closeScreenshotDialog = () => {
    setScreenshotDialog({
      open: false,
      images: [],
      title: '',
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <>
      <Card>
        <CardHeader 
          title="Your Trades" 
          subheader={`${totalTrades} trades recorded`}
          action={
            <Box sx={{ display: 'flex' }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterOpen(!filterOpen)}
                sx={{ mr: 1 }}
              >
                Filters {Object.keys(activeFilters).length > 0 && `(${Object.keys(activeFilters).length})`}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchTrades}
              >
                Refresh
              </Button>
            </Box>
          }
        />

        {filterOpen && (
          <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Filter Trades
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Symbol"
                  value={filters.symbol}
                  onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Setup Type</InputLabel>
                  <Select
                    value={filters.setupType}
                    onChange={(e) => setFilters({ ...filters, setupType: e.target.value })}
                    label="Setup Type"
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                    {Object.entries(setupTypeMap).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Outcome</InputLabel>
                  <Select
                    value={filters.outcome}
                    onChange={(e) => setFilters({ ...filters, outcome: e.target.value })}
                    label="Outcome"
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                    {Object.entries(outcomeMap).map(([value, { label }]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Min Profit ($)"
                  type="number"
                  value={filters.minProfit}
                  onChange={(e) => setFilters({ ...filters, minProfit: e.target.value })}
                  size="small"
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Max Loss ($)"
                  type="number"
                  value={filters.maxLoss}
                  onChange={(e) => setFilters({ ...filters, maxLoss: e.target.value })}
                  size="small"
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Tag"
                  value={filters.tag}
                  onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                  size="small"
                  placeholder="e.g., Good entry, Overtrading"
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                onClick={clearFilters}
                startIcon={<ClearIcon />}
                sx={{ mr: 1 }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={applyFilters}
                startIcon={<SearchIcon />}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        )}

        <Divider />

        <CardContent sx={{ p: 0 }}>
          {Object.keys(activeFilters).length > 0 && (
            <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="subtitle2" gutterBottom>
                Active Filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(activeFilters).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })}: ${value}`}
                    onDelete={() => {
                      const newFilters = { ...activeFilters };
                      delete newFilters[key];
                      setActiveFilters(newFilters);
                    }}
                    size="small"
                  />
                ))}
                <Chip
                  label="Clear All"
                  onDelete={clearFilters}
                  deleteIcon={<ClearIcon />}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          )}

          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'asc'}
                      onClick={() => handleRequestSort('date')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'symbol'}
                      direction={orderBy === 'symbol' ? order : 'asc'}
                      onClick={() => handleRequestSort('symbol')}
                    >
                      Symbol
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'setupType'}
                      direction={orderBy === 'setupType' ? order : 'asc'}
                      onClick={() => handleRequestSort('setupType')}
                    >
                      Setup
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'outcome'}
                      direction={orderBy === 'outcome' ? order : 'asc'}
                      onClick={() => handleRequestSort('outcome')}
                    >
                      Outcome
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'profitLoss'}
                      direction={orderBy === 'profitLoss' ? order : 'asc'}
                      onClick={() => handleRequestSort('profitLoss')}
                    >
                      P/L
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Entry/Exit</TableCell>
                  <TableCell>R:R</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Loading trades...
                    </TableCell>
                  </TableRow>
                ) : trades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No trades found. Adjust your filters or add a new trade.
                    </TableCell>
                  </TableRow>
                ) : (
                  trades.map((trade) => (
                    <TableRow hover key={trade.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="body2">
                              {format(new Date(trade.date), 'MMM d, yyyy')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {trade.entryTime} - {trade.exitTime}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {trade.symbol}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Size: {trade.positionSize}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {setupTypeMap[trade.setupType] || trade.setupType}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={outcomeMap[trade.outcome]?.label || trade.outcome}
                          color={outcomeMap[trade.outcome]?.color || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {formatProfitLoss(trade.profitLoss)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title="Entry Price">
                            <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                              {trade.entryPrice}
                            </Typography>
                          </Tooltip>
                          {trade.outcome === 'WIN' ? (
                            <ArrowUpwardIcon fontSize="small" color="success" />
                          ) : trade.outcome === 'LOSS' ? (
                            <ArrowDownwardIcon fontSize="small" color="error" />
                          ) : (
                            <RemoveCircleOutlineIcon fontSize="small" color="action" />
                          )}
                          <Tooltip title="Exit Price">
                            <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                              {trade.exitPrice}
                            </Typography>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Tooltip title="Planned Risk:Reward">
                            <Typography variant="caption" display="block">
                              Plan: {trade.plannedRiskReward}
                            </Typography>
                          </Tooltip>
                          <Tooltip title="Actual Risk:Reward">
                            <Typography variant="caption" display="block">
                              Actual: {trade.actualRiskReward}
                            </Typography>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {trade.tags ? (
                            trade.tags.split(',').map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No tags
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex' }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => viewTrade(trade.id)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Trade">
                            <IconButton size="small" onClick={() => editTrade(trade.id)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Screenshots">
                            <IconButton size="small" onClick={() => viewScreenshots(trade)}>
                              <ImageIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Trade">
                            <IconButton size="small" color="error" onClick={() => confirmDelete(trade.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalTrades}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* New Trade Button (floating) */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/trades/new')}
          sx={{ borderRadius: 28, px: 3, py: 1.5 }}
        >
          New Trade
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this trade? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteTrade} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Screenshots Dialog */}
      <Dialog
        open={screenshotDialog.open}
        onClose={closeScreenshotDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{screenshotDialog.title}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {screenshotDialog.images.map((image, index) => (
              <Grid item xs={12} key={index}>
                <Typography variant="subtitle2" gutterBottom>
                  {image.title}
                </Typography>
                <Box
                  component="img"
                  src={image.url}
                  alt={image.title}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeScreenshotDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TradesList;
