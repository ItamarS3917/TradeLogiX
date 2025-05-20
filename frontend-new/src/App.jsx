import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { FirebaseProvider } from './contexts/FirebaseContext';
// Use our bridge for authentication
import AuthProvider from './contexts/AuthContext';
import AuthBridgeProvider from './contexts/AuthContextBridge';
import LoadingProvider from './contexts/LoadingContext';
import NotificationProvider from './contexts/NotificationContext';
import SnackbarProvider from './contexts/SnackbarContext';
import ThemeProvider from './contexts/ThemeContext';
import { MobileProvider } from './contexts/MobileContext';
import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { TradesPage } from './pages/Trades';
import { PlanningPage } from './pages/Planning';
import StatisticsPage from './pages/Statistics';
import TradeSageAssistant from './pages/TradeSage/TradeSageAssistant';
import SettingsPage from './pages/SettingsPage';
import MigrationPage from './pages/MigrationPage';
import APIBridgeTest from './pages/APIBridgeTest';
import CloudSyncPage from './pages/CloudSync';
import TradingViewPage from './pages/TradingView';
import NotFound from './pages/NotFound';
import FirebaseTest from './components/Firebase/FirebaseTest';
import FirestoreDirectTest from './components/Firebase/FirestoreDirectTest';
import TradeServiceTest from './components/Firebase/TradeServiceTest';
import AnalyticsExample from './components/Firebase/AnalyticsExample';
import FirebaseDiagnostic from './components/Debug/FirebaseTest';
import DatabaseCleanup from './components/Debug/DatabaseCleanup';

// Get data source mode to determine which auth provider to use
import { getDataSourceMode } from './services/serviceFactory';

function App() {
  // Check if we should use the auth bridge - only use bridge if explicitly set
  const dataSourceMode = getDataSourceMode();
  const useAuthBridge = dataSourceMode === 'bridge';
  
  // Default to regular AuthProvider (Firebase) in most cases
  // Only use AuthBridgeProvider when in bridge mode
  const AuthProviderComponent = useAuthBridge ? AuthBridgeProvider : AuthProvider;
  
  // Force logout on app startup to ensure login screen is shown
  useEffect(() => {
    localStorage.removeItem('token');
    console.log('Cleared authentication state for fresh login');
  }, []);
  
  // Set a global variable to indicate that we're defaulting to Firebase
  // This can be useful for debugging and ensuring we're using Firebase
  if (typeof window !== 'undefined') {
    window.usingFirebase = dataSourceMode === 'firebase';
    window.dataSourceMode = dataSourceMode;
    
    // Log for development
    console.log('App initialization with data source mode:', dataSourceMode);
    console.log('Using Firebase:', window.usingFirebase);
  }
  
  return (
    <NotificationProvider>
      <SnackbarProvider>
        <LoadingProvider>
          <AuthProviderComponent>
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
                              <Route path="/dashboard" element={<Dashboard />} />
                              <Route path="/trades" element={<TradesPage />} />
                              <Route path="/planning" element={<PlanningPage />} />
                              <Route path="/statistics" element={<StatisticsPage />} />
                              <Route path="/tradesage" element={<TradeSageAssistant />} />
                              <Route path="/cloud-sync" element={<CloudSyncPage />} />
                              <Route path="/tradingview" element={<TradingViewPage />} />
                              <Route path="/settings" element={<SettingsPage />} />
                              <Route path="/migration" element={<MigrationPage />} />
                              <Route path="/api-bridge-test" element={<APIBridgeTest />} />
                              <Route path="/firebase-test" element={<FirebaseTest />} />
                              <Route path="/firebase-diagnostic" element={<FirebaseDiagnostic />} />
                              <Route path="/database-cleanup" element={<DatabaseCleanup />} />
                              <Route path="/trade-service-test" element={<TradeServiceTest />} />
                              <Route path="/firestore-direct-test" element={<FirestoreDirectTest />} />
                              <Route path="/analytics-example" element={<AnalyticsExample />} />
                              {/* Add other protected routes here */}
                              <Route path="*" element={<NotFound />} />
                            </Route>
                          </Route>
                          
                          {/* Redirect to dashboard */}
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </Router>
                    </OnboardingProvider>
                  </KeyboardShortcutsProvider>
                </MobileProvider>
              </ThemeProvider>
            </FirebaseProvider>
          </AuthProviderComponent>
        </LoadingProvider>
      </SnackbarProvider>
    </NotificationProvider>
  );
}

export default App;