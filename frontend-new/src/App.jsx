import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AuthProvider from './contexts/AuthContext';
import LoadingProvider from './contexts/LoadingContext';
import NotificationProvider from './contexts/NotificationContext';
import SnackbarProvider from './contexts/SnackbarContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { TradesPage } from './pages/Trades';
import { PlanningPage } from './pages/Planning';
import StatisticsPage from './pages/Statistics';
import NotFound from './pages/NotFound';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <SnackbarProvider>
          <LoadingProvider>
            <AuthProvider>
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
                      {/* Add other protected routes here */}
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Route>
                  
                  {/* Redirect to dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Router>
            </AuthProvider>
          </LoadingProvider>
        </SnackbarProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;