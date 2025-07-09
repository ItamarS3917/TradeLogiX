// File: frontend-new/src/pages/Backtesting/BacktestingPage.jsx
// Purpose: Enhanced main backtesting page component

import React from 'react';
import { BacktestingDashboard } from '../../components/Backtesting';

const BacktestingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BacktestingDashboard />
      </div>
    </div>
  );
};

export default BacktestingPage;
