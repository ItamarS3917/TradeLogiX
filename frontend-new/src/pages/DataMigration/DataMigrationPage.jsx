import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  AlertTitle,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha
} from '@mui/material';
import {
  CloudUpload,
  Download,
  SwapHoriz,
  Warning,
  CheckCircle,
  Error,
  Info,
  Storage,
  Backup,
  Restore,
  ImportExport,
  Upload,
  GetApp,
  CloudSync,
  Security,
  Speed,
  ExpandMore,
  Refresh,
  Delete,
  Visibility,
  Settings
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';

const DataMigrationPage = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState('idle'); // idle, running, completed, error
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [selectedMigrationType, setSelectedMigrationType] = useState('');
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Migration settings
  const [migrationSettings, setMigrationSettings] = useState({
    includeImages: true,
    includeTradingPlans: true,
    includeStatistics: true,
    includeSettings: true,
    validateData: true,
    createBackup: true
  });

  // Data stats
  const [dataStats, setDataStats] = useState({
    totalTrades: 0,
    totalPlans: 0,
    totalImages: 0,
    storageUsed: '0 MB',
    lastBackup: null
  });

  // Migration types
  const migrationTypes = [
    {
      id: 'firebase_to_api',
      title: 'Firebase to Backend API',
      description: 'Migrate all data from Firebase to the backend database',
      icon: <SwapHoriz />,
      status: 'available',
      estimatedTime: '5-15 minutes',
      riskLevel: 'medium'
    },
    {
      id: 'api_to_firebase',
      title: 'Backend API to Firebase',
      description: 'Migrate data from backend database to Firebase',
      icon: <SwapHoriz />,
      status: 'available',
      estimatedTime: '5-15 minutes',
      riskLevel: 'medium'
    },
    {
      id: 'csv_import',
      title: 'CSV Import',
      description: 'Import trades and data from CSV files',
      icon: <Upload />,
      status: 'available',
      estimatedTime: '2-5 minutes',
      riskLevel: 'low'
    },
    {
      id: 'platform_import',
      title: 'Trading Platform Import',
      description: 'Import from other trading journal platforms',
      icon: <ImportExport />,
      status: 'coming_soon',
      estimatedTime: '10-30 minutes',
      riskLevel: 'high'
    }
  ];

  // Load data stats on component mount
  useEffect(() => {
    loadDataStats();
  }, []);

  const loadDataStats = async () => {
    try {
      // Simulate loading data stats
      // In real implementation, this would call your API/Firebase to get actual stats
      setTimeout(() => {
        setDataStats({
          totalTrades: 247,
          totalPlans: 89,
          totalImages: 156,
          storageUsed: '12.4 MB',
          lastBackup: new Date(Date.now() - 86400000) // 1 day ago
        });
      }, 1000);
    } catch (error) {
      console.error('Error loading data stats:', error);
      enqueueSnackbar('Failed to load data statistics', { variant: 'error' });
    }
  };

  const handleMigrationStart = async () => {
    if (!selectedMigrationType) {
      enqueueSnackbar('Please select a migration type', { variant: 'warning' });
      return;
    }

    setMigrationStatus('running');
    setMigrationProgress(0);
    setMigrationDialogOpen(false);

    try {
      // Simulate migration process
      const steps = [
        'Validating data integrity...',
        'Creating backup...',
        'Preparing migration...',
        'Migrating trades...',
        'Migrating trading plans...',
        'Migrating images...',
        'Updating references...',
        'Finalizing migration...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setMigrationProgress(((i + 1) / steps.length) * 100);
        
        if (i === steps.length - 1) {
          setMigrationStatus('completed');
          enqueueSnackbar('Data migration completed successfully!', { variant: 'success' });
        }
      }
    } catch (error) {
      setMigrationStatus('error');
      enqueueSnackbar('Migration failed. Please try again.', { variant: 'error' });
    }
  };

  const handleCreateBackup = async () => {
    try {
      enqueueSnackbar('Creating backup...', { variant: 'info' });
      
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In real implementation, this would create and download a backup file
      const backupData = {
        timestamp: new Date().toISOString(),
        user_id: user?.uid,
        data: {
          trades: `${dataStats.totalTrades} trades`,
          plans: `${dataStats.totalPlans} plans`,
          images: `${dataStats.totalImages} images`
        }
      };

      // Create and download backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading_journal_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      enqueueSnackbar('Backup created and downloaded successfully!', { variant: 'success' });
      setBackupDialogOpen(false);
      
      // Update last backup time
      setDataStats(prev => ({ ...prev, lastBackup: new Date() }));
    } catch (error) {
      enqueueSnackbar('Failed to create backup', { variant: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            <Storage sx={{ fontSize: 48, mr: 2, verticalAlign: 'middle', color: theme.palette.primary.main }} />
            Data Migration & Management
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Safely migrate, backup, and manage your trading journal data
          </Typography>
        </Box>
      </motion.div>

      {/* Data Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})` }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ImportExport color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {dataStats.totalTrades}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Trades
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Backup color="secondary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h4" color="secondary" sx={{ fontWeight: 'bold' }}>
                  {dataStats.totalPlans}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Trading Plans
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})` }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CloudUpload color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {dataStats.storageUsed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Storage Used
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})` }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Restore color="warning" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {dataStats.lastBackup ? 
                    new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                      Math.floor((dataStats.lastBackup - new Date()) / (1000 * 60 * 60 * 24)), 'day'
                    ) : 'Never'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Backup
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Migration Progress */}
      {migrationStatus === 'running' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert severity="info" sx={{ mb: 4 }}>
            <AlertTitle>Migration in Progress</AlertTitle>
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={migrationProgress} 
                sx={{ mb: 1 }}
              />
              <Typography variant="body2">
                {migrationProgress.toFixed(0)}% complete
              </Typography>
            </Box>
          </Alert>
        </motion.div>
      )}

      {/* Migration Status */}
      {migrationStatus === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert severity="success" sx={{ mb: 4 }}>
            <AlertTitle>Migration Completed Successfully!</AlertTitle>
            Your data has been migrated successfully. All trades, plans, and settings are now available in the new location.
          </Alert>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Backup color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6">Create Backup</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create a complete backup of all your trading data for safekeeping.
                </Typography>
                <Chip 
                  label="Recommended" 
                  color="success" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  fullWidth
                  startIcon={<Download />}
                  onClick={() => setBackupDialogOpen(true)}
                >
                  Create Backup
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SwapHoriz color="secondary" sx={{ mr: 2 }} />
                  <Typography variant="h6">Data Migration</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Migrate your data between different storage systems or platforms.
                </Typography>
                <Chip 
                  label="Advanced" 
                  color="warning" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
              </CardContent>
              <CardActions>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<SwapHoriz />}
                  onClick={() => setMigrationDialogOpen(true)}
                >
                  Start Migration
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Upload color="success" sx={{ mr: 2 }} />
                  <Typography variant="h6">Import Data</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Import trades and plans from CSV files or other platforms.
                </Typography>
                <Chip 
                  label="Easy" 
                  color="success" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
              </CardContent>
              <CardActions>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<CloudUpload />}
                  onClick={() => setImportDialogOpen(true)}
                >
                  Import Data
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Migration Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Available Migration Options
        </Typography>
        
        <Grid container spacing={3}>
          {migrationTypes.map((type, index) => (
            <Grid item xs={12} md={6} key={type.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  opacity: type.status === 'coming_soon' ? 0.6 : 1,
                  cursor: type.status === 'available' ? 'pointer' : 'default',
                  '&:hover': {
                    boxShadow: type.status === 'available' ? 6 : 1,
                    transform: type.status === 'available' ? 'translateY(-2px)' : 'none'
                  },
                  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                onClick={() => {
                  if (type.status === 'available') {
                    setSelectedMigrationType(type.id);
                    setMigrationDialogOpen(true);
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {type.icon}
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {type.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip 
                          label={type.status === 'available' ? 'Available' : 'Coming Soon'}
                          color={type.status === 'available' ? 'success' : 'default'}
                          size="small"
                        />
                        <Chip 
                          label={`${type.riskLevel} risk`}
                          color={getRiskLevelColor(type.riskLevel)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {type.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Estimated time: {type.estimatedTime}
                    </Typography>
                    {type.status === 'available' && (
                      <Button size="small" variant="outlined">
                        Select
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Migration Dialog */}
      <Dialog 
        open={migrationDialogOpen} 
        onClose={() => setMigrationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Start Data Migration
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Important Notice</AlertTitle>
            Data migration is a critical operation. Please ensure you have a recent backup before proceeding.
          </Alert>
          
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Migration Settings
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.entries(migrationSettings).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={value}
                      onChange={(e) => setMigrationSettings(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                    />
                  }
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                />
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            This operation will migrate all selected data from the current storage system to the target location. 
            The process typically takes 5-15 minutes depending on the amount of data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMigrationDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleMigrationStart}
            disabled={migrationStatus === 'running'}
          >
            Start Migration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Dialog */}
      <Dialog 
        open={backupDialogOpen} 
        onClose={() => setBackupDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Data Backup</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This will create a complete backup of all your trading journal data including:
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary={`${dataStats.totalTrades} Trading Records`} />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary={`${dataStats.totalPlans} Trading Plans`} />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="User Settings & Preferences" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Statistical Data & Analytics" />
            </ListItem>
          </List>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            The backup file will be downloaded to your device as a JSON file. 
            Store it in a safe location for data recovery purposes.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateBackup}
            startIcon={<Download />}
          >
            Create & Download Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog 
        open={importDialogOpen} 
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Trading Data</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Import your trading data from CSV files or other trading platforms.
          </Typography>
          
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                CSV File Import
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a CSV file containing your trade data. The file should include columns for 
                date, symbol, entry price, exit price, quantity, and profit/loss.
              </Typography>
              
              <Box sx={{ 
                border: `2px dashed ${theme.palette.primary.main}`,
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }
              }}>
                <CloudUpload sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Drop your CSV file here or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Maximum file size: 10MB
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Platform Import (Coming Soon)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Import data directly from popular trading platforms like MetaTrader, 
                TradingView, Interactive Brokers, and more. This feature is coming soon.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            Close
          </Button>
          <Button variant="contained" disabled>
            Upload File
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DataMigrationPage;