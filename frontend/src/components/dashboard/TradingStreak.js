// File: frontend/src/components/dashboard/TradingStreak.js
// Purpose: Component displaying trading streaks and consistency

import React, { useEffect, useState } from 'react';

const TradingStreak = ({ streakData }) => {
  const [data, setData] = useState({
    currentStreak: 0,
    currentStreakType: 'none',
    longestWinStreak: 0,
    longestLossStreak: 0,
    consistency: 0,
    lastTwoWeeks: []
  });

  useEffect(() => {
    if (streakData) {
      setData(streakData);
    }
  }, [streakData]);

  // Helper to determine the color based on streak type
  const getStreakColor = (streakType) => {
    switch(streakType?.toLowerCase()) {
      case 'win':
        return 'text-green-600';
      case 'loss':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Helper to determine the icon based on streak type
  const getStreakIcon = (streakType) => {
    switch(streakType?.toLowerCase()) {
      case 'win':
        return '↑';
      case 'loss':
        return '↓';
      default:
        return '•';
    }
  };

  // Helper to determine the consistent trader badge based on consistency score
  const getConsistencyBadge = (consistency) => {
    if (!consistency && consistency !== 0) return null;

    let badgeColor = 'bg-gray-100 text-gray-800';
    let badgeText = 'Novice';

    if (consistency >= 90) {
      badgeColor = 'bg-purple-100 text-purple-800';
      badgeText = 'Master';
    } else if (consistency >= 75) {
      badgeColor = 'bg-blue-100 text-blue-800';
      badgeText = 'Expert';
    } else if (consistency >= 60) {
      badgeColor = 'bg-green-100 text-green-800';
      badgeText = 'Advanced';
    } else if (consistency >= 40) {
      badgeColor = 'bg-yellow-100 text-yellow-800';
      badgeText = 'Intermediate';
    } else if (consistency >= 20) {
      badgeColor = 'bg-orange-100 text-orange-800';
      badgeText = 'Beginner';
    }

    return (
      <span className={`${badgeColor} px-2 py-1 rounded-full text-xs`}>
        {badgeText}
      </span>
    );
  };

  // Generate calendar cells for last two weeks
  const renderCalendarCells = () => {
    if (!data.lastTwoWeeks || !data.lastTwoWeeks.length) {
      // Generate empty cells if no data
      return Array(14).fill(null).map((_, index) => (
        <div key={index} className="h-6 w-6 rounded-sm bg-gray-100 dark:bg-gray-700"></div>
      ));
    }

    return data.lastTwoWeeks.map((day, index) => {
      let bgColor = 'bg-gray-100 dark:bg-gray-700'; // Default/no trade
      
      if (day.outcome === 'win') {
        bgColor = 'bg-green-100 dark:bg-green-900';
      } else if (day.outcome === 'loss') {
        bgColor = 'bg-red-100 dark:bg-red-900';
      } else if (day.outcome === 'breakeven') {
        bgColor = 'bg-yellow-100 dark:bg-yellow-900';
      }
      
      return (
        <div 
          key={index} 
          className={`h-6 w-6 rounded-sm ${bgColor} flex items-center justify-center text-xs`}
          title={`${day.date}: ${day.outcome || 'No trade'}`}
        >
          {day.profit_loss > 0 ? '+' : day.profit_loss < 0 ? '-' : '='}
        </div>
      );
    });
  };

  return (
    <div className="trading-streak p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Trading Streak</h2>
      
      {/* Current Streak Section */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
        <div className={`text-2xl font-bold ${getStreakColor(data.currentStreakType)}`}>
          {data.currentStreak} {data.currentStreakType === 'win' ? 'Wins' : data.currentStreakType === 'loss' ? 'Losses' : 'None'}
        </div>
      </div>
      
      {/* Streak Records */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2 bg-gray-50 rounded dark:bg-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Best Win Streak</div>
          <div className="text-lg font-semibold text-green-600">{data.longestWinStreak}</div>
        </div>
        
        <div className="p-2 bg-gray-50 rounded dark:bg-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Worst Loss Streak</div>
          <div className="text-lg font-semibold text-red-600">{data.longestLossStreak}</div>
        </div>
      </div>
      
      {/* Consistency Score */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Consistency Score</div>
          {getConsistencyBadge(data.consistency)}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${data.consistency || 0}%` }}
          ></div>
        </div>
      </div>
      
      {/* Last 14 Days Calendar */}
      <div className="mb-2">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Last 14 Days</div>
        <div className="flex flex-wrap gap-1">
          {renderCalendarCells()}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex text-xs text-gray-500 mt-1 justify-end gap-2">
        <span>Win: +</span>
        <span>Loss: -</span>
        <span>Even: =</span>
      </div>
    </div>
  );
};

export default TradingStreak;
