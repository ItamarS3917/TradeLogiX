// File: frontend/src/components/dashboard/GoalTracker.js
// Purpose: Component for tracking trading goals and progress

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GoalTracker = ({ goals = [] }) => {
  const [expandedGoal, setExpandedGoal] = useState(null);
  
  // Toggle goal expansion
  const toggleGoal = (goalId) => {
    if (expandedGoal === goalId) {
      setExpandedGoal(null);
    } else {
      setExpandedGoal(goalId);
    }
  };
  
  // Calculate progress percentage
  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    let progress = (current / target) * 100;
    
    // Cap at 100% for display purposes
    return Math.min(progress, 100);
  };
  
  // Determine status color based on progress
  const getStatusColor = (progress) => {
    if (progress >= 100) return 'bg-green-500'; // Completed
    if (progress >= 70) return 'bg-blue-500';   // Good progress
    if (progress >= 30) return 'bg-yellow-500'; // Some progress
    return 'bg-red-500';                        // Limited progress
  };
  
  // Format days remaining
  const formatDaysRemaining = (deadline) => {
    if (!deadline) return 'No deadline';
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    
    // Calculate days difference
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return '1 day left';
    } else {
      return `${diffDays} days left`;
    }
  };
  
  // No goals yet
  if (!goals.length) {
    return (
      <div className="goal-tracker p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Goal Tracker</h2>
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          You haven't set any trading goals yet
        </div>
        <div className="text-center">
          <Link to="/settings/goals" className="btn btn-primary inline-block">
            Set Your Goals
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="goal-tracker p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Goal Tracker</h2>
        <Link to="/settings/goals" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
          Edit Goals
        </Link>
      </div>
      
      <div className="space-y-3">
        {goals.map(goal => (
          <div 
            key={goal.id}
            className="goal-item bg-gray-50 rounded-lg p-3 dark:bg-gray-700"
          >
            <div className="flex justify-between items-center">
              <h3 
                className="text-md font-medium dark:text-white cursor-pointer"
                onClick={() => toggleGoal(goal.id)}
              >
                {goal.title}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDaysRemaining(goal.deadline)}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 dark:bg-gray-600">
              <div 
                className={`${getStatusColor(calculateProgress(goal.current, goal.target))} h-2.5 rounded-full`} 
                style={{ width: `${calculateProgress(goal.current, goal.target)}%` }}
              ></div>
            </div>
            
            {/* Progress Numbers */}
            <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{goal.current} / {goal.target} {goal.unit}</span>
              <span>{Math.round(calculateProgress(goal.current, goal.target))}%</span>
            </div>
            
            {/* Expanded Goal Details */}
            {expandedGoal === goal.id && (
              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {goal.description || 'No description provided'}
                </p>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  {goal.category && (
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded dark:bg-gray-600 dark:text-gray-300">
                      {goal.category}
                    </span>
                  )}
                  
                  {goal.priority && (
                    <span className={`px-2 py-1 rounded ${
                      goal.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalTracker;
