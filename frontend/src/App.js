import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Import styles
import './App.css';

// Import pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import PlanningPage from './pages/PlanningPage';
import StatisticsPage from './pages/StatisticsPage';
import TradeJournalPage from './pages/TradeJournalPage';
import TradeSagePage from './pages/TradeSagePage';
import SettingsPage from './pages/SettingsPage';

// Import components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';

// Import context
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AlertProvider>
            <div className="App">
              <Navbar toggleSidebar={toggleSidebar} />
              <div className="main-container">
                <Sidebar isOpen={isSidebarOpen} />
                <div className={`content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/planning" element={<PlanningPage />} />
                    <Route path="/journal" element={<TradeJournalPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/tradesage" element={<TradeSagePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </div>
              </div>
              <Footer />
            </div>
          </AlertProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
