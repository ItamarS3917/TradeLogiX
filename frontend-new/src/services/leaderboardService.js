// File: leaderboardService.js
// Purpose: Main leaderboard service that uses Firebase

import { leaderboardService as firebaseLeaderboardService } from './firebase/leaderboardService';

// Export the Firebase implementation as the main service
export const leaderboardService = firebaseLeaderboardService;

// Re-export constants
export { LEADERBOARD_TYPES, ACHIEVEMENT_TYPES } from './firebase/leaderboardService';
