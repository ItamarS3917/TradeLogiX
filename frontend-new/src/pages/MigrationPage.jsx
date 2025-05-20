import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Paper, Stepper, Step, StepLabel, 
  CircularProgress, Alert, Divider, Accordion, AccordionSummary,
  AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, LinearProgress, Chip, IconButton, FormControlLabel, Checkbox
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VerifiedIcon from '@mui/icons-material/Verified';
import RestoreIcon from '@mui/icons-material/Restore';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { MigrationStatus, migrateAllData, createMigrationReport } from '../services/migrationUtils';
import migrationValidation from '../services/migrationTesting';
import migrationRollback from '../services/migrationRollback';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';

/**
 * MigrationPage component for Firebase to Backend data migration
 * @returns {JSX.Element} Migration UI
 */
const MigrationPage = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  
  const [activeStep, setActiveStep] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState(MigrationStatus.IDLE);
  const [migrationProgress, setMigrationProgress] = useState({
    total: 0,
    current: 0,
    entity: '',
    detail: ''
  });
  const [migrationError, setMigrationError] = useState(null);
  const [migrationResults, setMigrationResults] = useState(null);
  
  const [validationProgress, setValidationProgress] = useState({
    total: 0,
    current: 0,
    entity: '',
    detail: ''
  });
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const [rollbackProgress, setRollbackProgress] = useState({
    total: 0,
    current: 0,
    entity: '',
    detail: ''
  });
  const [rollbackResults, setRollbackResults] = useState(null);
  const [isRollingBack, setIsRollingBack] = useState(false);
  
  const [reportOpen, setReportOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [reportType, setReportType] = useState('migration');
  
  const [verificationTab, setVerificationTab] = useState(0);
  const [deleteFromAPI, setDeleteFromAPI] = useState(false);
  
  const steps = [
    'Preparation', 
    'Migration', 
    'Verification'
  ];
  
  // Listen for migration status changes
  useEffect(() => {
    const unsubscribe = MigrationStatus.addListener(({ status, progress, error }) => {
      setMigrationStatus(status);
      setMigrationProgress(progress);
      setMigrationError(error);
    });
    
    // Register validation progress callback
    migrationValidation.registerProgressCallback(setValidationProgress);
    
    // Register rollback progress callback
    migrationRollback.registerProgressCallback(setRollbackProgress);
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Progress to migration step when started
  useEffect(() => {
    if (migrationStatus === MigrationStatus.IN_PROGRESS && activeStep === 0) {
      setActiveStep(1);
    }
  }, [migrationStatus, activeStep]);
  
  // Progress to verification step when completed
  useEffect(() => {
    if ((migrationStatus === MigrationStatus.COMPLETED || migrationStatus === MigrationStatus.FAILED) && activeStep === 1) {
      setActiveStep(2);
    }
  }, [migrationStatus, activeStep]);
  
  /**
   * Handle migration start
   */
  const handleStartMigration = async () => {
    try {
      // Reset status
      MigrationStatus.reset();
      
      // Reset results
      setMigrationResults(null);
      setValidationResults(null);
      setRollbackResults(null);
      
      // Start migration
      const results = await migrateAllData({ userId: user?.id });
      
      // Store results
      setMigrationResults(results);
      
      // Create report
      const report = createMigrationReport(results);
      
      // Show success message
      showSnackbar('Migration completed', 'success');
      
      // Begin automatic validation
      handleStartValidation();
    } catch (error) {
      console.error('Error starting migration:', error);
      showSnackbar('Migration failed: ' + error.message, 'error');
    }
  };
  
  /**
   * Handle validation start
   */
  const handleStartValidation = async () => {
    try {
      setIsValidating(true);
      setValidationResults(null);
      
      // Validate migration
      const results = await migrationValidation.validateAll({ userId: user?.id });
      
      // Store results
      setValidationResults(results);
      
      // Show success message
      showSnackbar('Validation completed', 'success');
    } catch (error) {
      console.error('Error validating migration:', error);
      showSnackbar('Validation failed: ' + error.message, 'error');
    } finally {
      setIsValidating(false);
    }
  };
  
  /**
   * Handle rollback start
   */
  const handleStartRollback = async () => {
    try {
      setIsRollingBack(true);
      setRollbackResults(null);
      
      // Roll back migration
      const results = await migrationRollback.rollbackAll({ 
        userId: user?.id, 
        migrationBatch: migrationResults,
        deleteFromAPI
      });
      
      // Store results
      setRollbackResults(results);
      
      // Show success message
      showSnackbar('Rollback completed', 'success');
    } catch (error) {
      console.error('Error rolling back migration:', error);
      showSnackbar('Rollback failed: ' + error.message, 'error');
    } finally {
      setIsRollingBack(false);
    }
  };
  
  /**
   * Handle validation tab change
   * @param {Event} event - Event
   * @param {number} newValue - New tab value
   */
  const handleVerificationTabChange = (event, newValue) => {
    setVerificationTab(newValue);
  };
  
  /**
   * View migration report
   */
  const viewMigrationReport = () => {
    setReportType('migration');
    setReportContent(createMigrationReport(migrationResults));
    setReportOpen(true);
  };
  
  /**
   * View validation report
   */
  const viewValidationReport = () => {
    setReportType('validation');
    setReportContent(migrationValidation.createValidationReport());
    setReportOpen(true);
  };
  
  /**
   * View rollback report
   */
  const viewRollbackReport = () => {
    setReportType('rollback');
    setReportContent(migrationRollback.createRollbackReport());
    setReportOpen(true);
  };
  
  /**
   * Calculate overall progress percentage
   * @param {Object} progress - Progress object
   * @returns {number} Progress percentage (0-100)
   */
  const calculateProgress = (progress) => {
    if (progress.total === 0) return 0;
    return Math.round((progress.current / progress.total) * 100);
  };
  
  /**
   * Calculate overall success rate
   * @param {Object} results - Results object
   * @returns {number} Success rate percentage (0-100)
   */
  const calculateSuccessRate = (results) => {
    if (!results) return 0;
    
    const totalSuccess = 
      (results.trades?.success || 0) + 
      (results.dailyPlans?.success || 0) + 
      (results.journalEntries?.success || 0);
    
    const totalItems = 
      (results.trades?.total || 0) + 
      (results.dailyPlans?.total || 0) + 
      (results.journalEntries?.total || 0);
    
    if (totalItems === 0) return 0;
    return Math.round((totalSuccess / totalItems) * 100);
  };
  
  /**
   * Calculate validation success rate
   * @returns {number} Success rate percentage (0-100)
   */
  const calculateValidationSuccessRate = () => {
    if (!validationResults) return 0;
    
    const totalValidated = 
      validationResults.trades.validated + 
      validationResults.plans.validated + 
      validationResults.journals.validated;
    
    const totalItems = 
      validationResults.trades.total + 
      validationResults.plans.total + 
      validationResults.journals.total;
    
    if (totalItems === 0) return 0;
    return Math.round((totalValidated / totalItems) * 100);
  };
  
  /**
   * Calculate rollback success rate
   * @returns {number} Success rate percentage (0-100)
   */
  const calculateRollbackSuccessRate = () => {
    if (!rollbackResults) return 0;
    
    const totalSuccess = 
      rollbackResults.trades.success + 
      rollbackResults.plans.success + 
      rollbackResults.journals.success;
    
    const totalItems = 
      rollbackResults.trades.total + 
      rollbackResults.plans.total + 
      rollbackResults.journals.total;
    
    if (totalItems === 0) return 0;
    return Math.round((totalSuccess / totalItems) * 100);
  };
  
  /**
   * Download report
   */
  const downloadReport = () => {
    const fileName = `${reportType}-report-${new Date().toISOString().split('T')[0]}.md`;
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Firebase to API Migration
      </Typography>
      
      <Typography variant="body1" paragraph>
        This tool will migrate your data from Firebase to the backend database.
        This is a one-time operation that should be performed before switching
        to the backend API.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preparation
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Before migrating, please ensure that:
              <ul>
                <li>The backend server is running and accessible</li>
                <li>You have a stable internet connection</li>
                <li>You have saved any unsaved changes</li>
              </ul>
            </Alert>
            
            <Typography paragraph>
              This migration will:
            </Typography>
            
            <ul>
              <li>Copy all of your trades from Firebase to the backend database</li>
              <li>Copy all of your daily plans from Firebase to the backend database</li>
              <li>Copy all of your journal entries from Firebase to the backend database</li>
            </ul>
            
            <Typography paragraph>
              Your data in Firebase will not be modified or deleted. After migration,
              you can verify that all data has been successfully migrated before
              switching to the backend API.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<CloudUploadIcon />}
              onClick={handleStartMigration}
              sx={{ mt: 2 }}
            >
              Start Migration
            </Button>
          </Box>
        )}
        
        {activeStep === 1 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Migration in Progress
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <CircularProgress variant="determinate" value={calculateProgress(migrationProgress)} size={60} sx={{ mr: 2 }} />
              <Typography variant="h4">{calculateProgress(migrationProgress)}%</Typography>
            </Box>
            
            <Typography variant="body1" gutterBottom>
              {migrationProgress.detail}
            </Typography>
            
            {migrationProgress.entity && (
              <Typography variant="body2" color="text.secondary">
                Migrating {migrationProgress.entity}: {migrationProgress.current} of {migrationProgress.total}
              </Typography>
            )}
            
            <Alert 
              severity="warning" 
              sx={{ mt: 3, textAlign: 'left' }}
            >
              Do not close this window or navigate away during migration.
            </Alert>
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Migration {migrationStatus === MigrationStatus.COMPLETED ? 'Completed' : 'Failed'}
            </Typography>
            
            {migrationStatus === MigrationStatus.COMPLETED ? (
              <Alert 
                icon={<CheckCircleIcon fontSize="inherit" />}
                severity="success" 
                sx={{ mb: 3 }}
              >
                Migration completed successfully!
              </Alert>
            ) : (
              <Alert 
                icon={<ErrorIcon fontSize="inherit" />}
                severity="error" 
                sx={{ mb: 3 }}
              >
                Migration failed: {migrationError?.message || 'Unknown error'}
              </Alert>
            )}
            
            {migrationResults && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    Migration Results
                  </Typography>
                  
                  <Box>
                    <Button 
                      variant="outlined" 
                      startIcon={<DownloadIcon />}
                      onClick={viewMigrationReport}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      View Report
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateSuccessRate(migrationResults)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {calculateSuccessRate(migrationResults)}% Success
                  </Typography>
                </Box>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      Trades: {migrationResults.trades?.success || 0} succeeded, {migrationResults.trades?.failed || 0} failed
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      Total trades processed: {migrationResults.trades?.total || 0}
                    </Typography>
                    
                    {migrationResults.trades?.failed > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="error" gutterBottom>
                          Failed Trades:
                        </Typography>
                        
                        {migrationResults.trades.details
                          .filter(detail => detail.status === 'failed')
                          .map((detail, index) => (
                            <Typography key={index} variant="body2">
                              ID: {detail.id}, Error: {detail.error}
                            </Typography>
                          ))
                        }
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      Daily Plans: {migrationResults.dailyPlans?.success || 0} succeeded, {migrationResults.dailyPlans?.failed || 0} failed
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      Total plans processed: {migrationResults.dailyPlans?.total || 0}
                    </Typography>
                    
                    {migrationResults.dailyPlans?.failed > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="error" gutterBottom>
                          Failed Plans:
                        </Typography>
                        
                        {migrationResults.dailyPlans.details
                          .filter(detail => detail.status === 'failed')
                          .map((detail, index) => (
                            <Typography key={index} variant="body2">
                              ID: {detail.id}, Error: {detail.error}
                            </Typography>
                          ))
                        }
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      Journal Entries: {migrationResults.journalEntries?.success || 0} succeeded, {migrationResults.journalEntries?.failed || 0} failed
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      Total entries processed: {migrationResults.journalEntries?.total || 0}
                    </Typography>
                    
                    {migrationResults.journalEntries?.failed > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="error" gutterBottom>
                          Failed Entries:
                        </Typography>
                        
                        {migrationResults.journalEntries.details
                          .filter(detail => detail.status === 'failed')
                          .map((detail, index) => (
                            <Typography key={index} variant="body2">
                              ID: {detail.id}, Error: {detail.error}
                            </Typography>
                          ))
                        }
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
                
                <Divider sx={{ my: 3 }} />
                
                <Tabs
                  value={verificationTab}
                  onChange={handleVerificationTabChange}
                  variant="fullWidth"
                  sx={{ mb: 3 }}
                >
                  <Tab label="Validate" />
                  <Tab label="Rollback" />
                </Tabs>
                
                {verificationTab === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Validate Migration
                    </Typography>
                    
                    <Typography paragraph>
                      Validation checks that your data was migrated correctly by comparing
                      the data in Firebase with the data in the backend database.
                    </Typography>
                    
                    {isValidating ? (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        
                        <Typography variant="body1" gutterBottom>
                          {validationProgress.detail}
                        </Typography>
                        
                        {validationProgress.entity && (
                          <Typography variant="body2" color="text.secondary">
                            Validating {validationProgress.entity}: {validationProgress.current} of {validationProgress.total}
                          </Typography>
                        )}
                      </Box>
                    ) : validationResults ? (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6">
                            Validation Results
                          </Typography>
                          
                          <Box>
                            <Button 
                              variant="outlined" 
                              startIcon={<DownloadIcon />}
                              onClick={viewValidationReport}
                              size="small"
                            >
                              View Report
                            </Button>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flex: 1, mr: 2 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={calculateValidationSuccessRate()}
                              sx={{ height: 10, borderRadius: 5 }}
                              color={calculateValidationSuccessRate() >= 90 ? 'success' : 'warning'}
                            />
                          </Box>
                          <Typography variant="body1" fontWeight="bold">
                            {calculateValidationSuccessRate()}% Validated
                          </Typography>
                        </Box>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                              Trades: {validationResults.trades.validated} validated, {validationResults.trades.failed} failed
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2">
                              Total trades validated: {validationResults.trades.total}
                            </Typography>
                            
                            {validationResults.trades.failed > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="error" gutterBottom>
                                  Failed Trade Validations:
                                </Typography>
                                
                                {validationResults.trades.details
                                  .filter(detail => detail.status === 'failed')
                                  .map((detail, index) => (
                                    <Typography key={index} variant="body2">
                                      ID: {detail.id}, Reason: {detail.reason}
                                    </Typography>
                                  ))
                                }
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                              Daily Plans: {validationResults.plans.validated} validated, {validationResults.plans.failed} failed
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2">
                              Total plans validated: {validationResults.plans.total}
                            </Typography>
                            
                            {validationResults.plans.failed > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="error" gutterBottom>
                                  Failed Plan Validations:
                                </Typography>
                                
                                {validationResults.plans.details
                                  .filter(detail => detail.status === 'failed')
                                  .map((detail, index) => (
                                    <Typography key={index} variant="body2">
                                      ID: {detail.id}, Reason: {detail.reason}
                                    </Typography>
                                  ))
                                }
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                              Journal Entries: {validationResults.journals.validated} validated, {validationResults.journals.failed} failed
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2">
                              Total entries validated: {validationResults.journals.total}
                            </Typography>
                            
                            {validationResults.journals.failed > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="error" gutterBottom>
                                  Failed Journal Validations:
                                </Typography>
                                
                                {validationResults.journals.details
                                  .filter(detail => detail.status === 'failed')
                                  .map((detail, index) => (
                                    <Typography key={index} variant="body2">
                                      ID: {detail.id}, Reason: {detail.reason}
                                    </Typography>
                                  ))
                                }
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                        
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          startIcon={<VerifiedIcon />}
                          onClick={handleStartValidation}
                          sx={{ mt: 3 }}
                        >
                          Run Validation Again
                        </Button>
                      </Box>
                    ) : (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<VerifiedIcon />}
                        onClick={handleStartValidation}
                        sx={{ mt: 2 }}
                      >
                        Start Validation
                      </Button>
                    )}
                  </Box>
                )}
                
                {verificationTab === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Rollback Migration
                    </Typography>
                    
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      Rollback will restore your data in Firebase from the backend database.
                      Use this if migration validation failed or if you want to go back to
                      using Firebase.
                    </Alert>
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={deleteFromAPI}
                          onChange={(e) => setDeleteFromAPI(e.target.checked)}
                        />
                      }
                      label="Delete data from API after rolling back to Firebase"
                    />
                    
                    {isRollingBack ? (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        
                        <Typography variant="body1" gutterBottom>
                          {rollbackProgress.detail}
                        </Typography>
                        
                        {rollbackProgress.entity && (
                          <Typography variant="body2" color="text.secondary">
                            Rolling back {rollbackProgress.entity}: {rollbackProgress.current} of {rollbackProgress.total}
                          </Typography>
                        )}
                      </Box>
                    ) : rollbackResults ? (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6">
                            Rollback Results
                          </Typography>
                          
                          <Box>
                            <Button 
                              variant="outlined" 
                              startIcon={<DownloadIcon />}
                              onClick={viewRollbackReport}
                              size="small"
                            >
                              View Report
                            </Button>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flex: 1, mr: 2 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={calculateRollbackSuccessRate()}
                              sx={{ height: 10, borderRadius: 5 }}
                              color={calculateRollbackSuccessRate() >= 90 ? 'success' : 'warning'}
                            />
                          </Box>
                          <Typography variant="body1" fontWeight="bold">
                            {calculateRollbackSuccessRate()}% Success
                          </Typography>
                        </Box>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                              Trades: {rollbackResults.trades.success} rolled back, {rollbackResults.trades.failed} failed
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2">
                              Total trades processed: {rollbackResults.trades.total}
                            </Typography>
                            
                            {rollbackResults.trades.failed > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="error" gutterBottom>
                                  Failed Trade Rollbacks:
                                </Typography>
                                
                                {rollbackResults.trades.details
                                  .filter(detail => detail.status === 'failed')
                                  .map((detail, index) => (
                                    <Typography key={index} variant="body2">
                                      ID: {detail.id}, Error: {detail.error}
                                    </Typography>
                                  ))
                                }
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                              Daily Plans: {rollbackResults.plans.success} rolled back, {rollbackResults.plans.failed} failed
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2">
                              Total plans processed: {rollbackResults.plans.total}
                            </Typography>
                            
                            {rollbackResults.plans.failed > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="error" gutterBottom>
                                  Failed Plan Rollbacks:
                                </Typography>
                                
                                {rollbackResults.plans.details
                                  .filter(detail => detail.status === 'failed')
                                  .map((detail, index) => (
                                    <Typography key={index} variant="body2">
                                      ID: {detail.id}, Error: {detail.error}
                                    </Typography>
                                  ))
                                }
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                              Journal Entries: {rollbackResults.journals.success} rolled back, {rollbackResults.journals.failed} failed
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2">
                              Total entries processed: {rollbackResults.journals.total}
                            </Typography>
                            
                            {rollbackResults.journals.failed > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="error" gutterBottom>
                                  Failed Journal Rollbacks:
                                </Typography>
                                
                                {rollbackResults.journals.details
                                  .filter(detail => detail.status === 'failed')
                                  .map((detail, index) => (
                                    <Typography key={index} variant="body2">
                                      ID: {detail.id}, Error: {detail.error}
                                    </Typography>
                                  ))
                                }
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                        
                        <Button 
                          variant="outlined" 
                          color="error" 
                          startIcon={<RestoreIcon />}
                          onClick={handleStartRollback}
                          sx={{ mt: 3 }}
                        >
                          Run Rollback Again
                        </Button>
                      </Box>
                    ) : (
                      <Button 
                        variant="contained" 
                        color="error" 
                        startIcon={<RestoreIcon />}
                        onClick={handleStartRollback}
                        sx={{ mt: 2 }}
                      >
                        Start Rollback
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>
      
      <Dialog 
        open={reportOpen} 
        onClose={() => setReportOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {reportType === 'migration' ? 'Migration Report' : 
               reportType === 'validation' ? 'Validation Report' : 
               'Rollback Report'}
            </Typography>
            
            <Box>
              <IconButton onClick={() => setReportOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', p: 2 }}>
            {reportContent}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Close</Button>
          <Button 
            onClick={() => {
              navigator.clipboard.writeText(reportContent);
              showSnackbar('Report copied to clipboard', 'success');
            }}
            sx={{ mr: 1 }}
          >
            Copy to Clipboard
          </Button>
          <Button 
            variant="contained"
            onClick={downloadReport}
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MigrationPage;
