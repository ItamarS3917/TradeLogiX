import React from 'react';

const TestBacktesting = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl text-white mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-8 py-10">
            <h1 className="text-4xl font-bold mb-3">
              🎨 ENHANCED DESIGN IS WORKING! 🎉
            </h1>
            <p className="text-blue-100 text-lg">
              If you can see this with a blue gradient background, the enhanced design is working!
            </p>
          </div>
        </div>

        {/* Test Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ✅ Enhanced Backtesting Components Loaded
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This is a test component to verify the enhanced design is working.
            You should see modern styling with gradients, shadows, and rounded corners.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestBacktesting;
