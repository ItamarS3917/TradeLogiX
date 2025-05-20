// File: migrationUtils.js
// Purpose: Utilities for migrating data from Firebase to the backend database

import { 
  db, collection, getDocs,
  query, where, orderBy
} from '../config/firebase';
import api from './api';

/**
 * Migration status singleton
 */
export const MigrationStatus = {
  IDLE: 'idle',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  
  // Current state
  current: 'idle',
  
  // Progress details
  progress: {
    total: 0,
    current: 0,
    entity: '',
    detail: ''
  },
  
  // Error details
  error: null,
  
  // Set current status
  setStatus(status, detail = '') {
    this.current = status;
    this.progress.detail = detail;
    this.notifyListeners();
  },
  
  // Set progress details
  setProgress(current, total, entity) {
    this.progress.current = current;
    this.progress.total = total;
    this.progress.entity = entity;
    this.notifyListeners();
  },
  
  // Set error details
  setError(error) {
    this.error = error;
    this.current = this.FAILED;
    this.notifyListeners();
  },
  
  // Reset status
  reset() {
    this.current = this.IDLE;
    this.progress = {
      total: 0,
      current: 0,
      entity: '',
      detail: ''
    };
    this.error = null;
    this.notifyListeners();
  },
  
  // Event listeners for status changes
  listeners: [],
  
  // Add listener
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  },
  
  // Notify all listeners of changes
  notifyListeners() {
    this.listeners.forEach(listener => listener({
      status: this.current,
      progress: this.progress,
      error: this.error
    }));
  }
};

/**
 * Migrate trades from Firebase to backend database
 * @param {Object} options - Migration options
 * @returns {Promise<Object>} - Migration results
 */
export const migrateTrades = async (options = {}) => {
  try {
    const { userId, batchSize = 50, onProgress } = options;
    
    // Update status
    MigrationStatus.setStatus(MigrationStatus.IN_PROGRESS, 'Fetching trades from Firebase');
    
    // Get trades from Firebase
    let q = collection(db, 'trades');
    
    // Apply user ID filter if provided
    if (userId) {
      q = query(q, where('user_id', '==', userId));
    }
    
    // Apply sorting
    q = query(q, orderBy('entry_time', 'desc'));
    
    // Get documents
    const querySnapshot = await getDocs(q);
    
    // Extract trades
    const trades = [];
    querySnapshot.forEach((doc) => {
      trades.push({
        id: doc.id,
        firebase_id: doc.id, // Preserve Firebase ID for reference
        ...doc.data()
      });
    });
    
    // Update status
    MigrationStatus.setStatus(
      MigrationStatus.IN_PROGRESS, 
      `Found ${trades.length} trades to migrate`
    );
    MigrationStatus.setProgress(0, trades.length, 'trades');
    
    // Migrate in batches
    const results = {
      total: trades.length,
      success: 0,
      failed: 0,
      details: []
    };
    
    // Process in batches
    for (let i = 0; i < trades.length; i += batchSize) {
      const batch = trades.slice(i, i + batchSize);
      
      // Migrate batch
      const batchResults = await migrateTradeBatch(batch);
      
      // Update results
      results.success += batchResults.success;
      results.failed += batchResults.failed;
      results.details = [...results.details, ...batchResults.details];
      
      // Update progress
      MigrationStatus.setProgress(
        i + batch.length, 
        trades.length, 
        'trades'
      );
      
      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          total: trades.length,
          current: i + batch.length,
          success: results.success,
          failed: results.failed
        });
      }
    }
    
    // Update status
    if (results.failed > 0) {
      MigrationStatus.setStatus(
        MigrationStatus.FAILED, 
        `Migration completed with ${results.failed} errors`
      );
    } else {
      MigrationStatus.setStatus(
        MigrationStatus.COMPLETED, 
        `Successfully migrated ${results.success} trades`
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error during trade migration:', error);
    MigrationStatus.setError(error);
    throw error;
  }
};

/**
 * Migrate a batch of trades
 * @param {Array} trades - Batch of trades to migrate
 * @returns {Promise<Object>} - Batch migration results
 */
const migrateTradeBatch = async (trades) => {
  const results = {
    success: 0,
    failed: 0,
    details: []
  };
  
  // Process each trade
  for (const trade of trades) {
    try {
      // Transform trade data for API
      const apiTradeData = transformTradeDataForApi(trade);
      
      // Attempt to create trade in backend
      const response = await api.post('/trades', apiTradeData);
      
      // Record success
      results.success++;
      results.details.push({
        id: trade.id,
        firebase_id: trade.firebase_id,
        backend_id: response.data.id,
        status: 'success'
      });
    } catch (error) {
      // Record failure
      results.failed++;
      results.details.push({
        id: trade.id,
        firebase_id: trade.firebase_id,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Migrate daily plans from Firebase to backend database
 * @param {Object} options - Migration options
 * @returns {Promise<Object>} - Migration results
 */
export const migrateDailyPlans = async (options = {}) => {
  try {
    const { userId, batchSize = 50, onProgress } = options;
    
    // Update status
    MigrationStatus.setStatus(MigrationStatus.IN_PROGRESS, 'Fetching daily plans from Firebase');
    
    // Get daily plans from Firebase
    let q = collection(db, 'daily_plans');
    
    // Apply user ID filter if provided
    if (userId) {
      q = query(q, where('user_id', '==', userId));
    }
    
    // Apply sorting
    q = query(q, orderBy('date', 'desc'));
    
    // Get documents
    const querySnapshot = await getDocs(q);
    
    // Extract plans
    const plans = [];
    querySnapshot.forEach((doc) => {
      plans.push({
        id: doc.id,
        firebase_id: doc.id, // Preserve Firebase ID for reference
        ...doc.data()
      });
    });
    
    // Update status
    MigrationStatus.setStatus(
      MigrationStatus.IN_PROGRESS, 
      `Found ${plans.length} daily plans to migrate`
    );
    MigrationStatus.setProgress(0, plans.length, 'daily plans');
    
    // Migrate in batches
    const results = {
      total: plans.length,
      success: 0,
      failed: 0,
      details: []
    };
    
    // Process in batches
    for (let i = 0; i < plans.length; i += batchSize) {
      const batch = plans.slice(i, i + batchSize);
      
      // Migrate batch
      const batchResults = await migrateDailyPlanBatch(batch);
      
      // Update results
      results.success += batchResults.success;
      results.failed += batchResults.failed;
      results.details = [...results.details, ...batchResults.details];
      
      // Update progress
      MigrationStatus.setProgress(
        i + batch.length, 
        plans.length, 
        'daily plans'
      );
      
      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          total: plans.length,
          current: i + batch.length,
          success: results.success,
          failed: results.failed
        });
      }
    }
    
    // Update status
    if (results.failed > 0) {
      MigrationStatus.setStatus(
        MigrationStatus.FAILED, 
        `Migration completed with ${results.failed} errors`
      );
    } else {
      MigrationStatus.setStatus(
        MigrationStatus.COMPLETED, 
        `Successfully migrated ${results.success} daily plans`
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error during daily plan migration:', error);
    MigrationStatus.setError(error);
    throw error;
  }
};

/**
 * Migrate a batch of daily plans
 * @param {Array} plans - Batch of daily plans to migrate
 * @returns {Promise<Object>} - Batch migration results
 */
const migrateDailyPlanBatch = async (plans) => {
  const results = {
    success: 0,
    failed: 0,
    details: []
  };
  
  // Process each plan
  for (const plan of plans) {
    try {
      // Transform plan data for API
      const apiPlanData = transformPlanDataForApi(plan);
      
      // Attempt to create plan in backend
      const response = await api.post('/planning', apiPlanData);
      
      // Record success
      results.success++;
      results.details.push({
        id: plan.id,
        firebase_id: plan.firebase_id,
        backend_id: response.data.id,
        status: 'success'
      });
    } catch (error) {
      // Record failure
      results.failed++;
      results.details.push({
        id: plan.id,
        firebase_id: plan.firebase_id,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Migrate journal entries from Firebase to backend database
 * @param {Object} options - Migration options
 * @returns {Promise<Object>} - Migration results
 */
export const migrateJournalEntries = async (options = {}) => {
  try {
    const { userId, batchSize = 50, onProgress } = options;
    
    // Update status
    MigrationStatus.setStatus(MigrationStatus.IN_PROGRESS, 'Fetching journal entries from Firebase');
    
    // Get journal entries from Firebase
    let q = collection(db, 'journals');
    
    // Apply user ID filter if provided
    if (userId) {
      q = query(q, where('user_id', '==', userId));
    }
    
    // Apply sorting
    q = query(q, orderBy('date', 'desc'));
    
    // Get documents
    const querySnapshot = await getDocs(q);
    
    // Extract journal entries
    const journals = [];
    querySnapshot.forEach((doc) => {
      journals.push({
        id: doc.id,
        firebase_id: doc.id, // Preserve Firebase ID for reference
        ...doc.data()
      });
    });
    
    // Update status
    MigrationStatus.setStatus(
      MigrationStatus.IN_PROGRESS, 
      `Found ${journals.length} journal entries to migrate`
    );
    MigrationStatus.setProgress(0, journals.length, 'journal entries');
    
    // Migrate in batches
    const results = {
      total: journals.length,
      success: 0,
      failed: 0,
      details: []
    };
    
    // Process in batches
    for (let i = 0; i < journals.length; i += batchSize) {
      const batch = journals.slice(i, i + batchSize);
      
      // Migrate batch
      const batchResults = await migrateJournalBatch(batch);
      
      // Update results
      results.success += batchResults.success;
      results.failed += batchResults.failed;
      results.details = [...results.details, ...batchResults.details];
      
      // Update progress
      MigrationStatus.setProgress(
        i + batch.length, 
        journals.length, 
        'journal entries'
      );
      
      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          total: journals.length,
          current: i + batch.length,
          success: results.success,
          failed: results.failed
        });
      }
    }
    
    // Update status
    if (results.failed > 0) {
      MigrationStatus.setStatus(
        MigrationStatus.FAILED, 
        `Migration completed with ${results.failed} errors`
      );
    } else {
      MigrationStatus.setStatus(
        MigrationStatus.COMPLETED, 
        `Successfully migrated ${results.success} journal entries`
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error during journal entry migration:', error);
    MigrationStatus.setError(error);
    throw error;
  }
};

/**
 * Migrate a batch of journal entries
 * @param {Array} journals - Batch of journal entries to migrate
 * @returns {Promise<Object>} - Batch migration results
 */
const migrateJournalBatch = async (journals) => {
  const results = {
    success: 0,
    failed: 0,
    details: []
  };
  
  // Process each journal entry
  for (const journal of journals) {
    try {
      // Transform journal data for API
      const apiJournalData = transformJournalDataForApi(journal);
      
      // Attempt to create journal entry in backend
      const response = await api.post('/journals', apiJournalData);
      
      // Record success
      results.success++;
      results.details.push({
        id: journal.id,
        firebase_id: journal.firebase_id,
        backend_id: response.data.id,
        status: 'success'
      });
    } catch (error) {
      // Record failure
      results.failed++;
      results.details.push({
        id: journal.id,
        firebase_id: journal.firebase_id,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Transform trade data from Firebase format to API format
 * Helper function duplicated from apiBridge for migration
 * @param {Object} tradeData - Trade data in Firebase format
 * @returns {Object} - Trade data in API format
 */
const transformTradeDataForApi = (tradeData) => {
  // Deep clone to avoid modifying the original data
  const apiData = JSON.parse(JSON.stringify(tradeData));
  
  // Remove ID and Firebase ID (will be generated by backend)
  delete apiData.id;
  
  // Convert camelCase to snake_case if needed
  if (apiData.setupType && !apiData.setup_type) {
    apiData.setup_type = apiData.setupType;
    delete apiData.setupType;
  }
  
  if (apiData.entryPrice && !apiData.entry_price) {
    apiData.entry_price = apiData.entryPrice;
    delete apiData.entryPrice;
  }
  
  if (apiData.exitPrice && !apiData.exit_price) {
    apiData.exit_price = apiData.exitPrice;
    delete apiData.exitPrice;
  }
  
  if (apiData.entryTime && !apiData.entry_time) {
    apiData.entry_time = apiData.entryTime;
    delete apiData.entryTime;
  }
  
  if (apiData.exitTime && !apiData.exit_time) {
    apiData.exit_time = apiData.exitTime;
    delete apiData.exitTime;
  }
  
  if (apiData.positionSize && !apiData.position_size) {
    apiData.position_size = apiData.positionSize;
    delete apiData.positionSize;
  }
  
  if (apiData.plannedRiskReward && !apiData.planned_risk_reward) {
    apiData.planned_risk_reward = apiData.plannedRiskReward;
    delete apiData.plannedRiskReward;
  }
  
  if (apiData.actualRiskReward && !apiData.actual_risk_reward) {
    apiData.actual_risk_reward = apiData.actualRiskReward;
    delete apiData.actualRiskReward;
  }
  
  if (apiData.profitLoss && !apiData.profit_loss) {
    apiData.profit_loss = apiData.profitLoss;
    delete apiData.profitLoss;
  }
  
  if (apiData.emotionalState && !apiData.emotional_state) {
    apiData.emotional_state = apiData.emotionalState;
    delete apiData.emotionalState;
  }
  
  if (apiData.planAdherence && !apiData.plan_adherence) {
    apiData.plan_adherence = apiData.planAdherence;
    delete apiData.planAdherence;
  }
  
  if (apiData.userId && !apiData.user_id) {
    apiData.user_id = apiData.userId;
    delete apiData.userId;
  }
  
  // Handle timestamps
  if (apiData.createdAt && !apiData.created_at) {
    apiData.created_at = apiData.createdAt;
    delete apiData.createdAt;
  }
  
  if (apiData.updatedAt && !apiData.updated_at) {
    apiData.updated_at = apiData.updatedAt;
    delete apiData.updatedAt;
  }
  
  // Handle Firestore timestamps
  if (apiData.entry_time?.seconds) {
    apiData.entry_time = new Date(apiData.entry_time.seconds * 1000).toISOString();
  }
  
  if (apiData.exit_time?.seconds) {
    apiData.exit_time = new Date(apiData.exit_time.seconds * 1000).toISOString();
  }
  
  if (apiData.created_at?.seconds) {
    apiData.created_at = new Date(apiData.created_at.seconds * 1000).toISOString();
  }
  
  if (apiData.updated_at?.seconds) {
    apiData.updated_at = new Date(apiData.updated_at.seconds * 1000).toISOString();
  }
  
  return apiData;
};

/**
 * Transform plan data from Firebase format to API format
 * Helper function duplicated from apiBridge for migration
 * @param {Object} planData - Plan data in Firebase format
 * @returns {Object} - Plan data in API format
 */
const transformPlanDataForApi = (planData) => {
  // Deep clone to avoid modifying the original data
  const apiData = JSON.parse(JSON.stringify(planData));
  
  // Remove ID and Firebase ID (will be generated by backend)
  delete apiData.id;
  
  // Convert camelCase to snake_case if needed
  if (apiData.marketBias && !apiData.market_bias) {
    apiData.market_bias = apiData.marketBias;
    delete apiData.marketBias;
  }
  
  if (apiData.keyLevels && !apiData.key_levels) {
    apiData.key_levels = apiData.keyLevels;
    delete apiData.keyLevels;
  }
  
  if (apiData.riskParameters && !apiData.risk_parameters) {
    apiData.risk_parameters = apiData.riskParameters;
    delete apiData.riskParameters;
  }
  
  if (apiData.mentalState && !apiData.mental_state) {
    apiData.mental_state = apiData.mentalState;
    delete apiData.mentalState;
  }
  
  if (apiData.userId && !apiData.user_id) {
    apiData.user_id = apiData.userId;
    delete apiData.userId;
  }
  
  // Handle timestamps
  if (apiData.createdAt && !apiData.created_at) {
    apiData.created_at = apiData.createdAt;
    delete apiData.createdAt;
  }
  
  if (apiData.updatedAt && !apiData.updated_at) {
    apiData.updated_at = apiData.updatedAt;
    delete apiData.updatedAt;
  }
  
  // Handle date
  if (apiData.date?.seconds) {
    apiData.date = new Date(apiData.date.seconds * 1000).toISOString();
  }
  
  // Handle Firestore timestamps
  if (apiData.created_at?.seconds) {
    apiData.created_at = new Date(apiData.created_at.seconds * 1000).toISOString();
  }
  
  if (apiData.updated_at?.seconds) {
    apiData.updated_at = new Date(apiData.updated_at.seconds * 1000).toISOString();
  }
  
  return apiData;
};

/**
 * Transform journal data from Firebase format to API format
 * Helper function duplicated from apiBridge for migration
 * @param {Object} journalData - Journal data in Firebase format
 * @returns {Object} - Journal data in API format
 */
const transformJournalDataForApi = (journalData) => {
  // Deep clone to avoid modifying the original data
  const apiData = JSON.parse(JSON.stringify(journalData));
  
  // Remove ID and Firebase ID (will be generated by backend)
  delete apiData.id;
  
  // Convert camelCase to snake_case if needed
  if (apiData.moodRating && !apiData.mood_rating) {
    apiData.mood_rating = apiData.moodRating;
    delete apiData.moodRating;
  }
  
  if (apiData.relatedTradeIds && !apiData.related_trade_ids) {
    apiData.related_trade_ids = apiData.relatedTradeIds;
    delete apiData.relatedTradeIds;
  }
  
  if (apiData.userId && !apiData.user_id) {
    apiData.user_id = apiData.userId;
    delete apiData.userId;
  }
  
  // Handle timestamps
  if (apiData.createdAt && !apiData.created_at) {
    apiData.created_at = apiData.createdAt;
    delete apiData.createdAt;
  }
  
  if (apiData.updatedAt && !apiData.updated_at) {
    apiData.updated_at = apiData.updatedAt;
    delete apiData.updatedAt;
  }
  
  // Handle date
  if (apiData.date?.seconds) {
    apiData.date = new Date(apiData.date.seconds * 1000).toISOString();
  }
  
  // Handle Firestore timestamps
  if (apiData.created_at?.seconds) {
    apiData.created_at = new Date(apiData.created_at.seconds * 1000).toISOString();
  }
  
  if (apiData.updated_at?.seconds) {
    apiData.updated_at = new Date(apiData.updated_at.seconds * 1000).toISOString();
  }
  
  return apiData;
};

/**
 * Migrate all data from Firebase to backend database
 * @param {Object} options - Migration options
 * @returns {Promise<Object>} - Migration results
 */
export const migrateAllData = async (options = {}) => {
  try {
    const results = {
      trades: null,
      dailyPlans: null,
      journalEntries: null
    };
    
    // Update status
    MigrationStatus.setStatus(MigrationStatus.IN_PROGRESS, 'Starting full data migration');
    
    // Migrate trades
    MigrationStatus.setStatus(MigrationStatus.IN_PROGRESS, 'Migrating trades');
    results.trades = await migrateTrades(options);
    
    // Migrate daily plans
    MigrationStatus.setStatus(MigrationStatus.IN_PROGRESS, 'Migrating daily plans');
    results.dailyPlans = await migrateDailyPlans(options);
    
    // Migrate journal entries
    MigrationStatus.setStatus(MigrationStatus.IN_PROGRESS, 'Migrating journal entries');
    results.journalEntries = await migrateJournalEntries(options);
    
    // Update final status
    const totalFailed = 
      results.trades.failed + 
      results.dailyPlans.failed + 
      results.journalEntries.failed;
    
    if (totalFailed > 0) {
      MigrationStatus.setStatus(
        MigrationStatus.FAILED, 
        `Migration completed with ${totalFailed} errors`
      );
    } else {
      MigrationStatus.setStatus(
        MigrationStatus.COMPLETED, 
        `Successfully migrated all data`
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error during full data migration:', error);
    MigrationStatus.setError(error);
    throw error;
  }
};

/**
 * Create a migration report
 * @param {Object} results - Migration results
 * @returns {string} - Formatted migration report
 */
export const createMigrationReport = (results) => {
  if (!results) {
    return 'No migration results available';
  }
  
  let report = '# Migration Report\n\n';
  
  // Add trades report
  if (results.trades) {
    report += '## Trades\n\n';
    report += `- Total: ${results.trades.total}\n`;
    report += `- Success: ${results.trades.success}\n`;
    report += `- Failed: ${results.trades.failed}\n\n`;
    
    if (results.trades.failed > 0) {
      report += '### Failed Trades\n\n';
      
      results.trades.details
        .filter(detail => detail.status === 'failed')
        .forEach(detail => {
          report += `- ID: ${detail.id}, Error: ${detail.error}\n`;
        });
      
      report += '\n';
    }
  }
  
  // Add daily plans report
  if (results.dailyPlans) {
    report += '## Daily Plans\n\n';
    report += `- Total: ${results.dailyPlans.total}\n`;
    report += `- Success: ${results.dailyPlans.success}\n`;
    report += `- Failed: ${results.dailyPlans.failed}\n\n`;
    
    if (results.dailyPlans.failed > 0) {
      report += '### Failed Daily Plans\n\n';
      
      results.dailyPlans.details
        .filter(detail => detail.status === 'failed')
        .forEach(detail => {
          report += `- ID: ${detail.id}, Error: ${detail.error}\n`;
        });
      
      report += '\n';
    }
  }
  
  // Add journal entries report
  if (results.journalEntries) {
    report += '## Journal Entries\n\n';
    report += `- Total: ${results.journalEntries.total}\n`;
    report += `- Success: ${results.journalEntries.success}\n`;
    report += `- Failed: ${results.journalEntries.failed}\n\n`;
    
    if (results.journalEntries.failed > 0) {
      report += '### Failed Journal Entries\n\n';
      
      results.journalEntries.details
        .filter(detail => detail.status === 'failed')
        .forEach(detail => {
          report += `- ID: ${detail.id}, Error: ${detail.error}\n`;
        });
      
      report += '\n';
    }
  }
  
  return report;
};

export default {
  MigrationStatus,
  migrateTrades,
  migrateDailyPlans,
  migrateJournalEntries,
  migrateAllData,
  createMigrationReport
};
