import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { FirebaseProvider } from './contexts/FirebaseContext';
import AuthProvider from './contexts/AuthContext';
import LoadingProvider from './contexts/LoadingContext';
import NotificationProvider from './contexts/NotificationContext';
import SnackbarProvider from './contexts/SnackbarContext';
import ThemeProvider from './contexts/ThemeContext';
import { MobileProvider } from './contexts/MobileContext';
import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';

// Real Application Pages
import Login from './pages/Login';
import EnhancedDashboard from './pages/EnhancedDashboard';
import { TradesPage } from './pages/Trades';
import { PlanningPage } from './pages/Planning';
import StatisticsPage from './pages/Statistics';
import TradeSageAssistant from './pages/TradeSage/TradeSageAssistant';
import BacktestingPage from './pages/Backtesting/BacktestingPage';
import SettingsPage from './pages/SettingsPage';
import CloudSyncPage from './pages/CloudSync';
import TradingViewPage from './pages/TradingView';
import NotFound from './pages/NotFound';
import LeaderboardsPage from './pages/Leaderboards/LeaderboardsPage';
import DataMigrationPage from './pages/DataMigration/DataMigrationPage';
import SocialFeedPage from './pages/SocialFeed/SocialFeedPage';
import ProfessionalAnalyticsPage from './pages/ProfessionalAnalytics/ProfessionalAnalyticsPage';

function App() {
  // Initialize app for real data mode
  useEffect(() => {
    try {
      // Clear any old authentication tokens
      localStorage.removeItem('token');
      
      // Force Firebase mode for real data
      localStorage.setItem('data_source_mode', 'firebase');
      localStorage.setItem('use_real_data_only', 'true');
      
      // Clear any sample data flags
      localStorage.removeItem('use_sample_data');
      localStorage.removeItem('enable_mock_data');
      localStorage.removeItem('sample_data_added');
      
      // Mark onboarding as completed to prevent auto-tutorial
      // This ensures existing users don't get the tutorial on every refresh
      if (!localStorage.getItem('onboardingCompleted')) {
        localStorage.setItem('onboardingCompleted', 'true');
        console.log('📋 Onboarding marked as completed for existing user');
      }
      
      console.log('🎯 Trading Journal - Real Data Mode');
      console.log('📊 Using Firebase for all data storage');
      
      // Set global flags for debugging
      if (typeof window !== 'undefined') {
        window.isRealDataMode = true;
        window.dataSourceMode = 'firebase';
        window.sampleDataDisabled = true;
        
        // Add debugging helper
        window.appDebug = {
          checkMode: () => ({
            dataSource: localStorage.getItem('data_source_mode'),
            realDataOnly: localStorage.getItem('use_real_data_only'),
            isRealMode: window.isRealDataMode
          })
        };
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }, []);
  
  return (
    <NotificationProvider>
      <SnackbarProvider>
        <LoadingProvider>
          <AuthProvider>
            <FirebaseProvider>
              <ThemeProvider>
                <MobileProvider>
                  <KeyboardShortcutsProvider>
                    <OnboardingProvider>
                      <CssBaseline />
                      <Router>
                        <Routes>
                          {/* Public routes */}
                          <Route path="/login" element={<Login />} />
                          
                          {/* Protected routes */}
                          <Route element={<ProtectedRoute />}>
                            <Route element={<MainLayout />}>
                              {/* Core Trading Journal Features */}
                              <Route path="/dashboard" element={<EnhancedDashboard />} />
                              <Route path="/trades" element={<TradesPage />} />
                              <Route path="/planning" element={<PlanningPage />} />
                              <Route path="/statistics" element={<StatisticsPage />} />
                              <Route path="/backtesting" element={<BacktestingPage />} />
                              <Route path="/tradesage" element={<TradeSageAssistant />} />
                              <Route path="/social" element={<SocialFeedPage />} />
                              <Route path="/analytics" element={<ProfessionalAnalyticsPage />} />
                              <Route path="/leaderboards" element={<LeaderboardsPage />} />
                              
                              {/* Additional Features */}
                              <Route path="/cloud-sync" element={<CloudSyncPage />} />
                              <Route path="/tradingview" element={<TradingViewPage />} />
                              <Route path="/settings" element={<SettingsPage />} />
                              <Route path="/migration" element={<DataMigrationPage />} />
                              
                              {/* Catch all for undefined routes */}
                              <Route path="*" element={<NotFound />} />
                            </Route>
                          </Route>
                          
                          {/* Default redirect to dashboard */}
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </Router>
                    </OnboardingProvider>
                  </KeyboardShortcutsProvider>
                </MobileProvider>
              </ThemeProvider>
            </FirebaseProvider>
          </AuthProvider>
        </LoadingProvider>
      </SnackbarProvider>
    </NotificationProvider>
  );
}

export default App;