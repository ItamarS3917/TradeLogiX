// File: leaderboardService.js
// Purpose: Firebase Firestore service for leaderboards, achievements, and challenges

import { 
  db, collection, doc, addDoc, getDoc, getDocs, 
  updateDoc, deleteDoc, query, where, orderBy, limit,
  serverTimestamp, increment, runTransaction
} from '../../config/firebase';
import { auth } from '../../config/firebase';

// Collection references
const leaderboardsCollection = collection(db, 'leaderboards');
const achievementsCollection = collection(db, 'achievements');
const challengesCollection = collection(db, 'challenges');
const challengeParticipantsCollection = collection(db, 'challenge_participants');
const userStatsCollection = collection(db, 'user_stats');

// Leaderboard types
const LEADERBOARD_TYPES = {
  MONTHLY_WIN_RATE: 'monthly_win_rate',
  MONTHLY_PROFIT_FACTOR: 'monthly_profit_factor',
  MONTHLY_MAX_DRAWDOWN: 'monthly_max_drawdown',
  WEEKLY_CONSISTENCY: 'weekly_consistency',
  SETUP_SPECIFIC: 'setup_specific',
  DAILY_CHALLENGE: 'daily_challenge',
  STREAK_MASTER: 'streak_master',
  RISK_MANAGER: 'risk_manager'
};

// Achievement types
const ACHIEVEMENT_TYPES = {
  CONSISTENCY_KING: 'consistency_king',
  RISK_MANAGER: 'risk_manager',
  ICT_KILLZONE_MASTER: 'ict_killzone_master',
  MMXM_BREAKOUT_EXPERT: 'mmxm_breakout_expert',
  PLAN_FOLLOWER: 'plan_follower',
  EARLY_BIRD: 'early_bird',
  WIN_STREAK_5: 'win_streak_5',
  WIN_STREAK_10: 'win_streak_10',
  WIN_STREAK_20: 'win_streak_20',
  GREEN_WEEK: 'green_week',
  GREEN_MONTH: 'green_month'
};

class LeaderboardService {
  /**
   * Generate anonymous ID for leaderboard display
   */
  generateAnonymousId(userId, periodStart) {
    const prefixes = [
      'TradeMaster', 'ScalpKing', 'SwingLord', 'RiskMaster', 'ProfitHunter',
      'ChartWizard', 'MarketNinja', 'TrendRider', 'BreakoutPro', 'MomentumAce',
      'ICTGuru', 'MMXMExpert', 'PatternSeeker', 'VolatilityKing', 'FlowTrader'
    ];
    
    // Create a simple hash based on userId and period
    const hash = btoa(`${userId}_${periodStart}`).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const prefix = prefixes[Math.abs(hash.charCodeAt(0) + hash.charCodeAt(1)) % prefixes.length];
    
    return `${prefix}_${hash.slice(-4)}`;
  }

  /**
   * Calculate user statistics from trades
   */
  async calculateUserStats(userId, periodStart = null, periodEnd = null) {
    try {
      // Get user's trades
      let tradesQuery = query(
        collection(db, 'trades'),
        where('user_id', '==', userId),
        orderBy('entry_time', 'desc')
      );

      // Apply date filters if provided
      if (periodStart) {
        tradesQuery = query(tradesQuery, where('entry_time', '>=', periodStart));
      }
      if (periodEnd) {
        tradesQuery = query(tradesQuery, where('entry_time', '<=', periodEnd));
      }

      const tradesSnapshot = await getDocs(tradesQuery);
      const trades = tradesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (trades.length === 0) {
        return this.getEmptyStats();
      }

      // Calculate basic statistics
      const totalTrades = trades.length;
      const wins = trades.filter(t => t.outcome === 'Win');
      const losses = trades.filter(t => t.outcome === 'Loss');
      const breakevens = trades.filter(t => t.outcome === 'Breakeven');

      const winCount = wins.length;
      const lossCount = losses.length;
      const winRate = totalTrades > 0 ? (winCount / totalTrades * 100) : 0;

      // P&L calculations
      const totalPnl = trades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
      const winningPnl = wins.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
      const losingPnl = losses.reduce((sum, t) => sum + (t.profit_loss || 0), 0);

      const avgWin = winCount > 0 ? winningPnl / winCount : 0;
      const avgLoss = lossCount > 0 ? losingPnl / lossCount : 0;
      const profitFactor = losingPnl !== 0 ? Math.abs(winningPnl / losingPnl) : (winningPnl > 0 ? 999.99 : 0);

      // Risk metrics
      const largestWin = Math.max(...wins.map(t => t.profit_loss || 0), 0);
      const largestLoss = Math.min(...losses.map(t => t.profit_loss || 0), 0);

      // Calculate drawdown
      const maxDrawdown = this.calculateMaxDrawdown(trades);

      // Streak calculations
      const { currentStreak, currentStreakType } = this.calculateCurrentStreak(trades);
      const maxWinStreak = this.calculateMaxStreak(trades, 'Win');
      const maxLossStreak = this.calculateMaxStreak(trades, 'Loss');

      // Consistency and other scores
      const consistencyScore = this.calculateConsistencyScore(trades);
      const planAdherenceRate = this.calculatePlanAdherenceRate(trades);
      const riskScore = this.calculateRiskScore(trades);
      const setupStats = this.calculateSetupStats(trades);

      return {
        total_trades: totalTrades,
        win_count: winCount,
        loss_count: lossCount,
        breakeven_count: breakevens.length,
        win_rate: Math.round(winRate * 100) / 100,
        total_pnl: Math.round(totalPnl * 100) / 100,
        profit_factor: Math.round(profitFactor * 100) / 100,
        avg_win: Math.round(avgWin * 100) / 100,
        avg_loss: Math.round(avgLoss * 100) / 100,
        largest_win: Math.round(largestWin * 100) / 100,
        largest_loss: Math.round(largestLoss * 100) / 100,
        max_drawdown: Math.round(maxDrawdown * 100) / 100,
        current_streak: currentStreak,
        current_streak_type: currentStreakType,
        max_win_streak: maxWinStreak,
        max_loss_streak: maxLossStreak,
        consistency_score: Math.round(consistencyScore * 100) / 100,
        plan_adherence_rate: Math.round(planAdherenceRate * 100) / 100,
        risk_score: Math.round(riskScore * 100) / 100,
        setup_stats: setupStats
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      throw error;
    }
  }

  /**
   * Update leaderboard entries for a specific period
   */
  async updateLeaderboards(leaderboardType, periodStart, periodEnd) {
    try {
      // Get all users who traded in this period
      const tradesQuery = query(
        collection(db, 'trades'),
        where('entry_time', '>=', periodStart),
        where('entry_time', '<=', periodEnd)
      );

      const tradesSnapshot = await getDocs(tradesQuery);
      const userIds = [...new Set(tradesSnapshot.docs.map(doc => doc.data().user_id))];

      const entries = [];

      for (const userId of userIds) {
        const stats = await this.calculateUserStats(userId, periodStart, periodEnd);
        
        // Skip users with insufficient data
        if (stats.total_trades < 5) continue;

        // Create or update leaderboard entry
        const leaderboardEntry = {
          user_id: userId,
          leaderboard_type: leaderboardType,
          period_start: periodStart,
          period_end: periodEnd,
          anonymous_id: this.generateAnonymousId(userId, periodStart),
          win_rate: stats.win_rate,
          profit_factor: stats.profit_factor,
          total_trades: stats.total_trades,
          total_pnl: stats.total_pnl,
          max_drawdown: stats.max_drawdown,
          consistency_score: stats.consistency_score,
          risk_score: stats.risk_score,
          updated_at: serverTimestamp()
        };

        entries.push(leaderboardEntry);
      }

      // Calculate rankings
      this.calculateRankings(entries, leaderboardType);

      // Save entries to Firestore
      const batch = [];
      for (const entry of entries) {
        const docRef = doc(leaderboardsCollection);
        batch.push(addDoc(leaderboardsCollection, entry));
      }

      await Promise.all(batch);
      return entries.length;

    } catch (error) {
      console.error('Error updating leaderboards:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard entries
   */
  async getLeaderboard(leaderboardType, period, limit = 50, offset = 0) {
    try {
      const { periodStart } = this.getPeriodDates(period);

      const leaderboardQuery = query(
        leaderboardsCollection,
        where('leaderboard_type', '==', leaderboardType),
        where('period_start', '==', periodStart),
        orderBy('rank'),
        limit(limit)
      );

      const snapshot = await getDocs(leaderboardQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user's rank in leaderboard
   */
  async getUserRank(leaderboardType, period) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const { periodStart } = this.getPeriodDates(period);

      const userEntryQuery = query(
        leaderboardsCollection,
        where('user_id', '==', userId),
        where('leaderboard_type', '==', leaderboardType),
        where('period_start', '==', periodStart),
        limit(1)
      );

      const snapshot = await getDocs(userEntryQuery);
      
      if (snapshot.empty) {
        return null;
      }

      const userEntry = snapshot.docs[0].data();

      // Get total participants
      const totalQuery = query(
        leaderboardsCollection,
        where('leaderboard_type', '==', leaderboardType),
        where('period_start', '==', periodStart)
      );
      const totalSnapshot = await getDocs(totalQuery);

      return {
        ...userEntry,
        total_participants: totalSnapshot.size
      };

    } catch (error) {
      console.error('Error getting user rank:', error);
      throw error;
    }
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements() {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const achievementsQuery = query(
        achievementsCollection,
        where('user_id', '==', userId),
        where('is_active', '==', true),
        orderBy('earned_at', 'desc')
      );

      const snapshot = await getDocs(achievementsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      console.error('Error getting user achievements:', error);
      throw error;
    }
  }

  /**
   * Check and award new achievements
   */
  async checkAchievements() {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const stats = await this.calculateUserStats(userId);
      const newAchievements = [];

      // Check various achievement criteria
      const performanceAchievements = this.checkPerformanceAchievements(stats);
      const behavioralAchievements = await this.checkBehavioralAchievements(userId);
      const streakAchievements = this.checkStreakAchievements(stats);

      newAchievements.push(...performanceAchievements, ...behavioralAchievements, ...streakAchievements);

      // Award new achievements
      for (const [achievementType, criteria] of newAchievements) {
        const hasAchievement = await this.hasAchievement(userId, achievementType);
        if (!hasAchievement) {
          await this.awardAchievement(userId, achievementType, criteria);
        }
      }

      return {
        new_achievements: newAchievements.length,
        message: `Awarded ${newAchievements.length} new achievement(s)`
      };

    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  /**
   * Get active challenges
   */
  async getActiveChallenges() {
    try {
      const now = new Date();
      
      const challengesQuery = query(
        challengesCollection,
        where('is_active', '==', true),
        where('end_date', '>', now),
        orderBy('end_date'),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(challengesQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      console.error('Error getting active challenges:', error);
      throw error;
    }
  }

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      // Check if already participating
      const existingQuery = query(
        challengeParticipantsCollection,
        where('user_id', '==', userId),
        where('challenge_id', '==', challengeId),
        limit(1)
      );

      const existingSnapshot = await getDocs(existingQuery);
      if (!existingSnapshot.empty) {
        return existingSnapshot.docs[0].data();
      }

      // Add participation
      const participation = {
        user_id: userId,
        challenge_id: challengeId,
        joined_at: serverTimestamp(),
        current_score: 0,
        current_rank: null,
        trades_count: 0,
        completed: false
      };

      const docRef = await addDoc(challengeParticipantsCollection, participation);

      // Update challenge participant count
      const challengeRef = doc(challengesCollection, challengeId);
      await updateDoc(challengeRef, {
        current_participants: increment(1)
      });

      return {
        id: docRef.id,
        ...participation
      };

    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }

  /**
   * Get global statistics
   */
  async getGlobalStats() {
    try {
      // Get total active users (simplified - would need user status tracking)
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalActiveUsers = usersSnapshot.size;

      // Get current month participants
      const { periodStart } = this.getPeriodDates('current_month');
      const currentMonthQuery = query(
        leaderboardsCollection,
        where('period_start', '==', periodStart)
      );
      const currentMonthSnapshot = await getDocs(currentMonthQuery);

      // Get active challenges
      const now = new Date();
      const activeChallengesQuery = query(
        challengesCollection,
        where('is_active', '==', true),
        where('end_date', '>', now)
      );
      const activeChallengesSnapshot = await getDocs(activeChallengesQuery);

      // Get achievements this month
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const achievementsQuery = query(
        achievementsCollection,
        where('earned_at', '>=', monthStart)
      );
      const achievementsSnapshot = await getDocs(achievementsQuery);

      return {
        total_active_users: totalActiveUsers,
        current_month_participants: currentMonthSnapshot.size,
        active_challenges: activeChallengesSnapshot.size,
        achievements_awarded_this_month: achievementsSnapshot.size,
        leaderboard_types: Object.keys(LEADERBOARD_TYPES).length,
        achievement_types: Object.keys(ACHIEVEMENT_TYPES).length
      };

    } catch (error) {
      console.error('Error getting global stats:', error);
      throw error;
    }
  }

  /**
   * Get available leaderboard types
   */
  getLeaderboardTypes() {
    return Object.entries(LEADERBOARD_TYPES).map(([key, value]) => ({
      value,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: this.getLeaderboardDescription(value)
    }));
  }

  // Helper methods
  getEmptyStats() {
    return {
      total_trades: 0, win_count: 0, loss_count: 0, breakeven_count: 0,
      win_rate: 0, total_pnl: 0, profit_factor: 0, avg_win: 0, avg_loss: 0,
      largest_win: 0, largest_loss: 0, max_drawdown: 0, current_streak: 0,
      current_streak_type: null, max_win_streak: 0, max_loss_streak: 0,
      consistency_score: 0, plan_adherence_rate: 0, risk_score: 0, setup_stats: {}
    };
  }

  calculateMaxDrawdown(trades) {
    if (!trades.length) return 0;
    
    const sortedTrades = trades.sort((a, b) => new Date(a.entry_time) - new Date(b.entry_time));
    
    let runningPnl = 0;
    let peak = 0;
    let maxDrawdown = 0;
    
    for (const trade of sortedTrades) {
      if (trade.profit_loss) {
        runningPnl += trade.profit_loss;
        if (runningPnl > peak) {
          peak = runningPnl;
        }
        const drawdown = peak - runningPnl;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    }
    
    return maxDrawdown;
  }

  calculateCurrentStreak(trades) {
    if (!trades.length) return { currentStreak: 0, currentStreakType: null };
    
    const sortedTrades = trades.sort((a, b) => new Date(b.entry_time) - new Date(a.entry_time));
    
    const firstTradeOutcome = sortedTrades[0].outcome;
    if (firstTradeOutcome === 'Breakeven') {
      return { currentStreak: 0, currentStreakType: null };
    }
    
    let streak = 0;
    for (const trade of sortedTrades) {
      if (trade.outcome === firstTradeOutcome) {
        streak++;
      } else {
        break;
      }
    }
    
    return { 
      currentStreak: streak, 
      currentStreakType: firstTradeOutcome.toLowerCase() 
    };
  }

  calculateMaxStreak(trades, outcome) {
    if (!trades.length) return 0;
    
    const sortedTrades = trades.sort((a, b) => new Date(a.entry_time) - new Date(b.entry_time));
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (const trade of sortedTrades) {
      if (trade.outcome === outcome) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  }

  calculateConsistencyScore(trades) {
    if (trades.length < 5) return 0;
    
    const returns = trades.map(t => t.profit_loss || 0);
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Higher consistency = lower standard deviation relative to mean
    const cvScore = mean !== 0 ? Math.max(0, 100 - (stdDev / Math.abs(mean) * 100)) : 50;
    return Math.min(100, Math.max(0, cvScore));
  }

  calculatePlanAdherenceRate(trades) {
    const planTrades = trades.filter(t => t.plan_adherence);
    if (!planTrades.length) return 0;
    
    const followedPlan = planTrades.filter(t => 
      t.plan_adherence === 'Followed' || t.plan_adherence === 'Partial'
    ).length;
    
    return (followedPlan / planTrades.length) * 100;
  }

  calculateRiskScore(trades) {
    if (!trades.length) return 0;
    
    let totalScore = 0;
    let scoreCount = 0;
    
    for (const trade of trades) {
      let tradeScore = 0;
      
      // R:R ratio score
      if (trade.actual_risk_reward && trade.actual_risk_reward > 0) {
        if (trade.actual_risk_reward >= 2) tradeScore += 40;
        else if (trade.actual_risk_reward >= 1) tradeScore += 20;
      }
      
      // Plan adherence score
      if (trade.plan_adherence === 'Followed') tradeScore += 30;
      else if (trade.plan_adherence === 'Partial') tradeScore += 15;
      
      // Position size reasonableness
      if (trade.position_size && trade.position_size > 0 && trade.position_size <= 10) {
        tradeScore += 30;
      }
      
      totalScore += tradeScore;
      scoreCount++;
    }
    
    return scoreCount > 0 ? totalScore / scoreCount : 0;
  }

  calculateSetupStats(trades) {
    const setupStats = {};
    
    for (const trade of trades) {
      const setup = trade.setup_type || 'Unknown';
      if (!setupStats[setup]) {
        setupStats[setup] = { trades: 0, wins: 0, total_pnl: 0 };
      }
      
      setupStats[setup].trades++;
      if (trade.outcome === 'Win') setupStats[setup].wins++;
      if (trade.profit_loss) setupStats[setup].total_pnl += trade.profit_loss;
    }
    
    // Calculate win rates
    for (const [setup, stats] of Object.entries(setupStats)) {
      stats.win_rate = stats.trades > 0 ? Math.round((stats.wins / stats.trades * 100) * 100) / 100 : 0;
      stats.total_pnl = Math.round(stats.total_pnl * 100) / 100;
    }
    
    return setupStats;
  }

  calculateRankings(entries, leaderboardType) {
    // Sort based on leaderboard type
    if (leaderboardType === LEADERBOARD_TYPES.MONTHLY_WIN_RATE) {
      entries.sort((a, b) => b.win_rate - a.win_rate);
    } else if (leaderboardType === LEADERBOARD_TYPES.MONTHLY_PROFIT_FACTOR) {
      entries.sort((a, b) => b.profit_factor - a.profit_factor);
    } else if (leaderboardType === LEADERBOARD_TYPES.MONTHLY_MAX_DRAWDOWN) {
      entries.sort((a, b) => a.max_drawdown - b.max_drawdown); // Lower is better
    } else if (leaderboardType === LEADERBOARD_TYPES.WEEKLY_CONSISTENCY) {
      entries.sort((a, b) => b.consistency_score - a.consistency_score);
    } else if (leaderboardType === LEADERBOARD_TYPES.RISK_MANAGER) {
      entries.sort((a, b) => b.risk_score - a.risk_score);
    }
    
    // Assign ranks and percentiles
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
      entry.percentile = entries.length > 0 ? ((entries.length - index) / entries.length) * 100 : 0;
    });
  }

  getPeriodDates(period) {
    const now = new Date();
    
    if (period === 'current_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { periodStart: start, periodEnd: end };
    } else if (period === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { periodStart: start, periodEnd: end };
    } else if (period === 'current_week') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { periodStart: start, periodEnd: end };
    } else if (period === 'last_week') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay() - 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { periodStart: start, periodEnd: end };
    }
    
    throw new Error('Invalid period');
  }

  checkPerformanceAchievements(stats) {
    const achievements = [];
    
    if (stats.win_rate >= 80 && stats.total_trades >= 20) {
      achievements.push([ACHIEVEMENT_TYPES.CONSISTENCY_KING, { win_rate: stats.win_rate }]);
    }
    
    if (stats.profit_factor >= 3.0 && stats.total_trades >= 15) {
      achievements.push([ACHIEVEMENT_TYPES.RISK_MANAGER, { profit_factor: stats.profit_factor }]);
    }
    
    // Setup-specific achievements
    for (const [setup, setupStats] of Object.entries(stats.setup_stats)) {
      if (setupStats.win_rate >= 75 && setupStats.trades >= 10) {
        if (setup.toUpperCase().includes('ICT')) {
          achievements.push([ACHIEVEMENT_TYPES.ICT_KILLZONE_MASTER, setupStats]);
        } else if (setup.toUpperCase().includes('MMXM')) {
          achievements.push([ACHIEVEMENT_TYPES.MMXM_BREAKOUT_EXPERT, setupStats]);
        }
      }
    }
    
    return achievements;
  }

  async checkBehavioralAchievements(userId) {
    const achievements = [];
    
    // Check recent trades for plan adherence
    const recentTradesQuery = query(
      collection(db, 'trades'),
      where('user_id', '==', userId),
      where('entry_time', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Last 30 days
      orderBy('entry_time', 'desc')
    );
    
    const recentTradesSnapshot = await getDocs(recentTradesQuery);
    const recentTrades = recentTradesSnapshot.docs.map(doc => doc.data());
    
    if (recentTrades.length >= 10) {
      const adherenceRate = this.calculatePlanAdherenceRate(recentTrades);
      if (adherenceRate >= 90) {
        achievements.push([ACHIEVEMENT_TYPES.PLAN_FOLLOWER, { adherence_rate: adherenceRate }]);
      }
    }
    
    // Check for early bird (consistent planning)
    const recentPlansQuery = query(
      collection(db, 'daily_plans'),
      where('user_id', '==', userId),
      where('date', '>=', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)), // Last 14 days
      orderBy('date', 'desc')
    );
    
    const recentPlansSnapshot = await getDocs(recentPlansQuery);
    if (recentPlansSnapshot.size >= 10) {
      achievements.push([ACHIEVEMENT_TYPES.EARLY_BIRD, { plans_count: recentPlansSnapshot.size }]);
    }
    
    return achievements;
  }

  checkStreakAchievements(stats) {
    const achievements = [];
    
    if (stats.current_streak_type === 'win') {
      if (stats.current_streak >= 20) {
        achievements.push([ACHIEVEMENT_TYPES.WIN_STREAK_20, { streak: stats.current_streak }]);
      } else if (stats.current_streak >= 10) {
        achievements.push([ACHIEVEMENT_TYPES.WIN_STREAK_10, { streak: stats.current_streak }]);
      } else if (stats.current_streak >= 5) {
        achievements.push([ACHIEVEMENT_TYPES.WIN_STREAK_5, { streak: stats.current_streak }]);
      }
    }
    
    return achievements;
  }

  async hasAchievement(userId, achievementType) {
    const achievementQuery = query(
      achievementsCollection,
      where('user_id', '==', userId),
      where('achievement_type', '==', achievementType),
      where('is_active', '==', true),
      limit(1)
    );
    
    const snapshot = await getDocs(achievementQuery);
    return !snapshot.empty;
  }

  async awardAchievement(userId, achievementType, criteria) {
    const achievementDetails = this.getAchievementDetails(achievementType);
    
    const achievement = {
      user_id: userId,
      achievement_type: achievementType,
      title: achievementDetails.title,
      description: achievementDetails.description,
      icon: achievementDetails.icon,
      criteria_met: criteria,
      earned_at: serverTimestamp(),
      is_active: true,
      is_featured: false
    };
    
    await addDoc(achievementsCollection, achievement);
  }

  getAchievementDetails(achievementType) {
    const details = {
      [ACHIEVEMENT_TYPES.CONSISTENCY_KING]: {
        title: 'Consistency King',
        description: 'Achieved 80%+ win rate with at least 20 trades',
        icon: 'crown'
      },
      [ACHIEVEMENT_TYPES.RISK_MANAGER]: {
        title: 'Risk Manager',
        description: 'Maintained 3.0+ profit factor with at least 15 trades',
        icon: 'shield'
      },
      [ACHIEVEMENT_TYPES.ICT_KILLZONE_MASTER]: {
        title: 'ICT Kill Zone Master',
        description: 'Achieved 75%+ win rate on ICT setups',
        icon: 'target'
      },
      [ACHIEVEMENT_TYPES.MMXM_BREAKOUT_EXPERT]: {
        title: 'MMXM Breakout Expert',
        description: 'Achieved 75%+ win rate on MMXM breakouts',
        icon: 'trending_up'
      },
      [ACHIEVEMENT_TYPES.PLAN_FOLLOWER]: {
        title: 'Plan Follower',
        description: 'Followed trading plan in 90%+ of recent trades',
        icon: 'assignment_turned_in'
      },
      [ACHIEVEMENT_TYPES.EARLY_BIRD]: {
        title: 'Early Bird',
        description: 'Consistent pre-market planning for 10+ days',
        icon: 'schedule'
      },
      [ACHIEVEMENT_TYPES.WIN_STREAK_5]: {
        title: '5-Win Streak',
        description: 'Won 5 consecutive trades',
        icon: 'whatshot'
      },
      [ACHIEVEMENT_TYPES.WIN_STREAK_10]: {
        title: '10-Win Streak',
        description: 'Won 10 consecutive trades',
        icon: 'local_fire_department'
      },
      [ACHIEVEMENT_TYPES.WIN_STREAK_20]: {
        title: '20-Win Streak',
        description: 'Won 20 consecutive trades - Legendary!',
        icon: 'military_tech'
      }
    };
    
    return details[achievementType] || {
      title: achievementType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `Earned ${achievementType.replace(/_/g, ' ').toLowerCase()} achievement`,
      icon: 'emoji_events'
    };
  }

  getLeaderboardDescription(leaderboardType) {
    const descriptions = {
      [LEADERBOARD_TYPES.MONTHLY_WIN_RATE]: 'Traders with highest win rate this month (minimum 5 trades)',
      [LEADERBOARD_TYPES.MONTHLY_PROFIT_FACTOR]: 'Traders with best profit factor this month',
      [LEADERBOARD_TYPES.MONTHLY_MAX_DRAWDOWN]: 'Traders with lowest maximum drawdown (best risk control)',
      [LEADERBOARD_TYPES.WEEKLY_CONSISTENCY]: 'Most consistent traders this week',
      [LEADERBOARD_TYPES.SETUP_SPECIFIC]: 'Best performance on specific trading setups',
      [LEADERBOARD_TYPES.DAILY_CHALLENGE]: 'Daily trading challenges and competitions',
      [LEADERBOARD_TYPES.STREAK_MASTER]: 'Traders with longest win streaks',
      [LEADERBOARD_TYPES.RISK_MANAGER]: 'Best risk management scores'
    };
    
    return descriptions[leaderboardType] || 'Trading performance leaderboard';
  }
}

// Create and export service instance
const leaderboardService = new LeaderboardService();
export { leaderboardService, LEADERBOARD_TYPES, ACHIEVEMENT_TYPES };
