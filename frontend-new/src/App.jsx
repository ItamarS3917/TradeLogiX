import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import AuthProvider from './contexts/AuthContext';
import LoadingProvider from './contexts/LoadingContext';
import NotificationProvider from './contexts/NotificationContext';
import SnackbarProvider from './contexts/SnackbarContext';
import ThemeProvider from './contexts/ThemeContext';
import { MobileProvider } from './contexts/MobileContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { TradesPage } from './pages/Trades';
import { PlanningPage } from './pages/Planning';
import StatisticsPage from './pages/Statistics';
import TradeSageAssistant from './pages/TradeSage/TradeSageAssistant';
import SettingsPage from './pages/Settings';
import CloudSyncPage from './pages/CloudSync';
import TradingViewPage from './pages/TradingView';
import NotFound from './pages/NotFound';



function App() {
  return (
    <NotificationProvider>
      <SnackbarProvider>
        <LoadingProvider>
          <AuthProvider>
            <ThemeProvider>
              <MobileProvider>
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
                        {/* Add other protected routes here */}
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Route>
                    
                    {/* Redirect to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Router>
              </MobileProvider>
            </ThemeProvider>
          </AuthProvider>
        </LoadingProvider>
      </SnackbarProvider>
    </NotificationProvider>
  );
}

export default App;