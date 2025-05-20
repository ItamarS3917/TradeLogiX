// migrationRollback.js
// Utility for rolling back data migration from backend to Firebase

import api from './api';
import { 
  db, collection, doc, addDoc, getDoc, getDocs, setDoc,
  query, where, orderBy, limit, deleteDoc
} from '../config/firebase';

/**
 * MigrationRollback class for rolling back migrations
 */
export class MigrationRollback {
  constructor() {
    this.rollbackResults = {
      trades: { total: 0, success: 0, failed: 0, details: [] },
      plans: { total: 0, success: 0, failed: 0, details: [] },
      journals: { total: 0, success: 0, failed: 0, details: [] }
    };
    
    this.rollbackProgress = {
      current: 0,
      total: 0,
      entity: '',
      detail: ''
    };
  }
  
  /**
   * Reset rollback results
   */
  reset() {
    this.rollbackResults = {
      trades: { total: 0, success: 0, failed: 0, details: [] },
      plans: { total: 0, success: 0, failed: 0, details: [] },
      journals: { total: 0, success: 0, failed: 0, details: [] }
    };
    
    this.rollbackProgress = {
      current: 0,
      total: 0,
      entity: '',
      detail: ''
    };
  }
  
  /**
   * Set rollback progress
   * @param {number} current - Current progress
   * @param {number} total - Total items
   * @param {string} entity - Entity type
   * @param {string} detail - Detail message
   */
  setProgress(current, total, entity, detail = '') {
    this.rollbackProgress = {
      current,
      total,
      entity,
      detail
    };
    
    if (this.onProgress) {
      this.onProgress(this.rollbackProgress);
    }
  }
  
  /**
   * Register progress callback
   * @param {Function} callback - Progress callback
   */
  registerProgressCallback(callback) {
    this.onProgress = callback;
  }
  
  /**
   * Roll back trades
   * @param {Object} options - Rollback options
   * @returns {Promise<Object>} - Rollback results
   */
  async rollbackTrades(options = {}) {
    const { userId, migrationBatch = null, deleteFromAPI = false } = options;
    
    try {
      let apiTrades = [];
      
      // If migration batch is provided, use it to identify trades
      if (migrationBatch && migrationBatch.trades && migrationBatch.trades.details) {
        // Get API IDs of migrated trades
        const apiIds = migrationBatch.trades.details
          .filter(detail => detail.status === 'success')
          .map(detail => detail.backend_id)
          .filter(id => id); // Filter out null/undefined
        
        // Update progress
        this.setProgress(0, apiIds.length, 'trades', 'Fetching migrated trades from API');
        
        // If no migrated trades, return empty results
        if (apiIds.length === 0) {
          return this.rollbackResults.trades;
        }
        
        // Get trades from API by IDs
        // NOTE: This is a simplification, in a real application we would need
        // to fetch trades by ID in batches (chunking the IDs array)
        apiTrades = await Promise.all(
          apiIds.map(id => api.get(`/trades/${id}`).then(response => response.data))
        );
      } else {
        // No migration batch provided, get trades from API by user ID
        if (!userId) {
          throw new Error('Either migrationBatch or userId must be provided');
        }
        
        // Get trades from API
        apiTrades = await api.get('/trades', {
          params: { 
            user_id: userId,
            limit: 1000 // Use a large limit to get all trades
          }
        }).then(response => response.data);
      }
      
      // Update progress
      this.setProgress(0, apiTrades.length, 'trades', 'Rolling back trades');
      
      // Set total for rollback results
      this.rollbackResults.trades.total = apiTrades.length;
      
      // Process each trade
      for (let i = 0; i < apiTrades.length; i++) {
        const apiTrade = apiTrades[i];
        
        try {
          // Check if trade has a firebase_id
          if (!apiTrade.firebase_id) {
            throw new Error('Trade does not have a firebase_id');
          }
          
          // Check if trade exists in Firebase
          const firebaseDoc = await getDoc(doc(db, 'trades', apiTrade.firebase_id));
          
          if (firebaseDoc.exists()) {
            // Trade exists in Firebase, update it
            await setDoc(doc(db, 'trades', apiTrade.firebase_id), {
              ...apiTrade,
              id: undefined, // Remove API ID
              api_id: apiTrade.id, // Store API ID for reference
              updated_at: new Date()
            });
          } else {
            // Trade does not exist in Firebase, create it
            await setDoc(doc(db, 'trades', apiTrade.firebase_id), {
              ...apiTrade,
              id: undefined, // Remove API ID
              api_id: apiTrade.id, // Store API ID for reference
              created_at: new Date(),
              updated_at: new Date()
            });
          }
          
          // Delete from API if requested
          if (deleteFromAPI) {
            await api.delete(`/trades/${apiTrade.id}`);
          }
          
          // Record success
          this.rollbackResults.trades.success++;
          this.rollbackResults.trades.details.push({
            id: apiTrade.id,
            firebase_id: apiTrade.firebase_id,
            status: 'success'
          });
        } catch (error) {
          // Record failure
          this.rollbackResults.trades.failed++;
          this.rollbackResults.trades.details.push({
            id: apiTrade.id,
            firebase_id: apiTrade.firebase_id || 'unknown',
            status: 'failed',
            error: error.message
          });
        }
        
        // Update progress
        this.setProgress(i + 1, apiTrades.length, 'trades', 'Rolling back trades');
      }
      
      return this.rollbackResults.trades;
    } catch (error) {
      console.error('Error rolling back trades:', error);
      throw error;
    }
  }
  
  /**
   * Roll back plans
   * @param {Object} options - Rollback options
   * @returns {Promise<Object>} - Rollback results
   */
  async rollbackPlans(options = {}) {
    const { userId, migrationBatch = null, deleteFromAPI = false } = options;
    
    try {
      let apiPlans = [];
      
      // If migration batch is provided, use it to identify plans
      if (migrationBatch && migrationBatch.dailyPlans && migrationBatch.dailyPlans.details) {
        // Get API IDs of migrated plans
        const apiIds = migrationBatch.dailyPlans.details
          .filter(detail => detail.status === 'success')
          .map(detail => detail.backend_id)
          .filter(id => id); // Filter out null/undefined
        
        // Update progress
        this.setProgress(0, apiIds.length, 'plans', 'Fetching migrated plans from API');
        
        // If no migrated plans, return empty results
        if (apiIds.length === 0) {
          return this.rollbackResults.plans;
        }
        
        // Get plans from API by IDs
        apiPlans = await Promise.all(
          apiIds.map(id => api.get(`/planning/${id}`).then(response => response.data))
        );
      } else {
        // No migration batch provided, get plans from API by user ID
        if (!userId) {
          throw new Error('Either migrationBatch or userId must be provided');
        }
        
        // Get plans from API
        apiPlans = await api.get('/planning', {
          params: { 
            user_id: userId,
            limit: 1000 // Use a large limit to get all plans
          }
        }).then(response => response.data);
      }
      
      // Update progress
      this.setProgress(0, apiPlans.length, 'plans', 'Rolling back plans');
      
      // Set total for rollback results
      this.rollbackResults.plans.total = apiPlans.length;
      
      // Process each plan
      for (let i = 0; i < apiPlans.length; i++) {
        const apiPlan = apiPlans[i];
        
        try {
          // Check if plan has a firebase_id
          if (!apiPlan.firebase_id) {
            throw new Error('Plan does not have a firebase_id');
          }
          
          // Check if plan exists in Firebase
          const firebaseDoc = await getDoc(doc(db, 'daily_plans', apiPlan.firebase_id));
          
          if (firebaseDoc.exists()) {
            // Plan exists in Firebase, update it
            await setDoc(doc(db, 'daily_plans', apiPlan.firebase_id), {
              ...apiPlan,
              id: undefined, // Remove API ID
              api_id: apiPlan.id, // Store API ID for reference
              updated_at: new Date()
            });
          } else {
            // Plan does not exist in Firebase, create it
            await setDoc(doc(db, 'daily_plans', apiPlan.firebase_id), {
              ...apiPlan,
              id: undefined, // Remove API ID
              api_id: apiPlan.id, // Store API ID for reference
              created_at: new Date(),
              updated_at: new Date()
            });
          }
          
          // Delete from API if requested
          if (deleteFromAPI) {
            await api.delete(`/planning/${apiPlan.id}`);
          }
          
          // Record success
          this.rollbackResults.plans.success++;
          this.rollbackResults.plans.details.push({
            id: apiPlan.id,
            firebase_id: apiPlan.firebase_id,
            status: 'success'
          });
        } catch (error) {
          // Record failure
          this.rollbackResults.plans.failed++;
          this.rollbackResults.plans.details.push({
            id: apiPlan.id,
            firebase_id: apiPlan.firebase_id || 'unknown',
            status: 'failed',
            error: error.message
          });
        }
        
        // Update progress
        this.setProgress(i + 1, apiPlans.length, 'plans', 'Rolling back plans');
      }
      
      return this.rollbackResults.plans;
    } catch (error) {
      console.error('Error rolling back plans:', error);
      throw error;
    }
  }
  
  /**
   * Roll back journals
   * @param {Object} options - Rollback options
   * @returns {Promise<Object>} - Rollback results
   */
  async rollbackJournals(options = {}) {
    const { userId, migrationBatch = null, deleteFromAPI = false } = options;
    
    try {
      let apiJournals = [];
      
      // If migration batch is provided, use it to identify journals
      if (migrationBatch && migrationBatch.journalEntries && migrationBatch.journalEntries.details) {
        // Get API IDs of migrated journals
        const apiIds = migrationBatch.journalEntries.details
          .filter(detail => detail.status === 'success')
          .map(detail => detail.backend_id)
          .filter(id => id); // Filter out null/undefined
        
        // Update progress
        this.setProgress(0, apiIds.length, 'journals', 'Fetching migrated journals from API');
        
        // If no migrated journals, return empty results
        if (apiIds.length === 0) {
          return this.rollbackResults.journals;
        }
        
        // Get journals from API by IDs
        apiJournals = await Promise.all(
          apiIds.map(id => api.get(`/journals/${id}`).then(response => response.data))
        );
      } else {
        // No migration batch provided, get journals from API by user ID
        if (!userId) {
          throw new Error('Either migrationBatch or userId must be provided');
        }
        
        // Get journals from API
        apiJournals = await api.get('/journals', {
          params: { 
            user_id: userId,
            limit: 1000 // Use a large limit to get all journals
          }
        }).then(response => response.data);
      }
      
      // Update progress
      this.setProgress(0, apiJournals.length, 'journals', 'Rolling back journals');
      
      // Set total for rollback results
      this.rollbackResults.journals.total = apiJournals.length;
      
      // Process each journal
      for (let i = 0; i < apiJournals.length; i++) {
        const apiJournal = apiJournals[i];
        
        try {
          // Check if journal has a firebase_id
          if (!apiJournal.firebase_id) {
            throw new Error('Journal does not have a firebase_id');
          }
          
          // Check if journal exists in Firebase
          const firebaseDoc = await getDoc(doc(db, 'journals', apiJournal.firebase_id));
          
          if (firebaseDoc.exists()) {
            // Journal exists in Firebase, update it
            await setDoc(doc(db, 'journals', apiJournal.firebase_id), {
              ...apiJournal,
              id: undefined, // Remove API ID
              api_id: apiJournal.id, // Store API ID for reference
              updated_at: new Date()
            });
          } else {
            // Journal does not exist in Firebase, create it
            await setDoc(doc(db, 'journals', apiJournal.firebase_id), {
              ...apiJournal,
              id: undefined, // Remove API ID
              api_id: apiJournal.id, // Store API ID for reference
              created_at: new Date(),
              updated_at: new Date()
            });
          }
          
          // Delete from API if requested
          if (deleteFromAPI) {
            await api.delete(`/journals/${apiJournal.id}`);
          }
          
          // Record success
          this.rollbackResults.journals.success++;
          this.rollbackResults.journals.details.push({
            id: apiJournal.id,
            firebase_id: apiJournal.firebase_id,
            status: 'success'
          });
        } catch (error) {
          // Record failure
          this.rollbackResults.journals.failed++;
          this.rollbackResults.journals.details.push({
            id: apiJournal.id,
            firebase_id: apiJournal.firebase_id || 'unknown',
            status: 'failed',
            error: error.message
          });
        }
        
        // Update progress
        this.setProgress(i + 1, apiJournals.length, 'journals', 'Rolling back journals');
      }
      
      return this.rollbackResults.journals;
    } catch (error) {
      console.error('Error rolling back journals:', error);
      throw error;
    }
  }
  
  /**
   * Roll back all entities
   * @param {Object} options - Rollback options
   * @returns {Promise<Object>} - Rollback results
   */
  async rollbackAll(options = {}) {
    try {
      // Reset rollback results
      this.reset();
      
      // Roll back trades
      await this.rollbackTrades(options);
      
      // Roll back plans
      await this.rollbackPlans(options);
      
      // Roll back journals
      await this.rollbackJournals(options);
      
      return this.rollbackResults;
    } catch (error) {
      console.error('Error rolling back migration:', error);
      throw error;
    }
  }
  
  /**
   * Create rollback report
   * @returns {string} - Rollback report
   */
  createRollbackReport() {
    let report = '# Migration Rollback Report\n\n';
    
    // Add trades report
    report += '## Trades\n\n';
    report += `- Total rolled back: ${this.rollbackResults.trades.success}/${this.rollbackResults.trades.total}\n`;
    report += `- Failed: ${this.rollbackResults.trades.failed}\n\n`;
    
    if (this.rollbackResults.trades.failed > 0) {
      report += '### Failed Trade Rollbacks\n\n';
      
      this.rollbackResults.trades.details
        .filter(detail => detail.status === 'failed')
        .forEach(detail => {
          report += `- ID: ${detail.id}, Firebase ID: ${detail.firebase_id}, Error: ${detail.error}\n`;
        });
      
      report += '\n';
    }
    
    // Add plans report
    report += '## Daily Plans\n\n';
    report += `- Total rolled back: ${this.rollbackResults.plans.success}/${this.rollbackResults.plans.total}\n`;
    report += `- Failed: ${this.rollbackResults.plans.failed}\n\n`;
    
    if (this.rollbackResults.plans.failed > 0) {
      report += '### Failed Plan Rollbacks\n\n';
      
      this.rollbackResults.plans.details
        .filter(detail => detail.status === 'failed')
        .forEach(detail => {
          report += `- ID: ${detail.id}, Firebase ID: ${detail.firebase_id}, Error: ${detail.error}\n`;
        });
      
      report += '\n';
    }
    
    // Add journals report
    report += '## Journal Entries\n\n';
    report += `- Total rolled back: ${this.rollbackResults.journals.success}/${this.rollbackResults.journals.total}\n`;
    report += `- Failed: ${this.rollbackResults.journals.failed}\n\n`;
    
    if (this.rollbackResults.journals.failed > 0) {
      report += '### Failed Journal Rollbacks\n\n';
      
      this.rollbackResults.journals.details
        .filter(detail => detail.status === 'failed')
        .forEach(detail => {
          report += `- ID: ${detail.id}, Firebase ID: ${detail.firebase_id}, Error: ${detail.error}\n`;
        });
      
      report += '\n';
    }
    
    report += '\n## Rollback Summary\n\n';
    const totalSuccess = 
      this.rollbackResults.trades.success + 
      this.rollbackResults.plans.success + 
      this.rollbackResults.journals.success;
    
    const totalFailed = 
      this.rollbackResults.trades.failed + 
      this.rollbackResults.plans.failed + 
      this.rollbackResults.journals.failed;
    
    const totalItems = 
      this.rollbackResults.trades.total + 
      this.rollbackResults.plans.total + 
      this.rollbackResults.journals.total;
    
    report += `- Total items rolled back: ${totalSuccess}/${totalItems}\n`;
    report += `- Total failed: ${totalFailed}\n`;
    report += `- Rollback success rate: ${((totalSuccess / totalItems) * 100).toFixed(2)}%\n`;
    
    return report;
  }
}

// Export MigrationRollback class
export default new MigrationRollback();
