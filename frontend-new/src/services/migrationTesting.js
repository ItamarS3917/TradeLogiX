// migrationTesting.js
// Utility for testing and validating data migration from Firebase to the backend API

import api from './api';
import { 
  db, collection, doc, getDoc, getDocs, 
  query, where, orderBy, limit
} from '../config/firebase';
import { MigrationStatus } from './migrationUtils';

/**
 * MigrationValidation class for testing and validating migrations
 */
export class MigrationValidation {
  constructor() {
    this.validationResults = {
      trades: { total: 0, validated: 0, failed: 0, details: [] },
      plans: { total: 0, validated: 0, failed: 0, details: [] },
      journals: { total: 0, validated: 0, failed: 0, details: [] }
    };
    
    this.validationProgress = {
      current: 0,
      total: 0,
      entity: '',
      detail: ''
    };
  }
  
  /**
   * Reset validation results
   */
  reset() {
    this.validationResults = {
      trades: { total: 0, validated: 0, failed: 0, details: [] },
      plans: { total: 0, validated: 0, failed: 0, details: [] },
      journals: { total: 0, validated: 0, failed: 0, details: [] }
    };
    
    this.validationProgress = {
      current: 0,
      total: 0,
      entity: '',
      detail: ''
    };
  }
  
  /**
   * Set validation progress
   * @param {number} current - Current progress
   * @param {number} total - Total items
   * @param {string} entity - Entity type
   * @param {string} detail - Detail message
   */
  setProgress(current, total, entity, detail = '') {
    this.validationProgress = {
      current,
      total,
      entity,
      detail
    };
    
    if (this.onProgress) {
      this.onProgress(this.validationProgress);
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
   * Validate trades migration
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} - Validation results
   */
  async validateTrades(options = {}) {
    const { userId, limit: itemLimit = 100, sampleSize = 20 } = options;
    
    try {
      // Get trades from Firebase
      let fbQuery = collection(db, 'trades');
      
      // Apply user ID filter if provided
      if (userId) {
        fbQuery = query(fbQuery, where('user_id', '==', userId));
      }
      
      // Apply sorting and limit
      fbQuery = query(fbQuery, orderBy('created_at', 'desc'), limit(itemLimit));
      
      // Get documents
      const fbQuerySnapshot = await getDocs(fbQuery);
      
      // Extract trades
      const fbTrades = [];
      fbQuerySnapshot.forEach((doc) => {
        fbTrades.push({
          id: doc.id,
          firebase_id: doc.id,
          ...doc.data()
        });
      });
      
      // Update progress
      this.setProgress(0, fbTrades.length, 'trades', 'Fetching trades from API');
      
      // Get trades from API
      const apiTrades = await api.get('/trades', {
        params: { 
          user_id: userId,
          limit: itemLimit
        }
      }).then(response => response.data);
      
      // Create lookup for API trades by firebase_id
      const apiTradesByFirebaseId = {};
      apiTrades.forEach(trade => {
        if (trade.firebase_id) {
          apiTradesByFirebaseId[trade.firebase_id] = trade;
        }
      });
      
      // Select sample trades for detailed validation
      const sampleSize = Math.min(fbTrades.length, 20);
      const sampleIndices = this.getRandomIndices(fbTrades.length, sampleSize);
      const sampleTrades = sampleIndices.map(index => fbTrades[index]);
      
      // Validate each sample trade
      this.validationResults.trades.total = sampleTrades.length;
      
      for (let i = 0; i < sampleTrades.length; i++) {
        const fbTrade = sampleTrades[i];
        const apiTrade = apiTradesByFirebaseId[fbTrade.firebase_id];
        
        if (!apiTrade) {
          // Trade not found in API
          this.validationResults.trades.failed++;
          this.validationResults.trades.details.push({
            id: fbTrade.id,
            firebase_id: fbTrade.firebase_id,
            status: 'failed',
            reason: 'Trade not found in API'
          });
        } else {
          // Validate trade fields
          const validationResult = this.validateTradeFields(fbTrade, apiTrade);
          
          if (validationResult.valid) {
            this.validationResults.trades.validated++;
            this.validationResults.trades.details.push({
              id: fbTrade.id,
              firebase_id: fbTrade.firebase_id,
              api_id: apiTrade.id,
              status: 'validated'
            });
          } else {
            this.validationResults.trades.failed++;
            this.validationResults.trades.details.push({
              id: fbTrade.id,
              firebase_id: fbTrade.firebase_id,
              api_id: apiTrade.id,
              status: 'failed',
              reason: validationResult.reason,
              differences: validationResult.differences
            });
          }
        }
        
        // Update progress
        this.setProgress(i + 1, sampleTrades.length, 'trades', 'Validating trades');
      }
      
      return this.validationResults.trades;
    } catch (error) {
      console.error('Error validating trades:', error);
      throw error;
    }
  }
  
  /**
   * Validate daily plans migration
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} - Validation results
   */
  async validatePlans(options = {}) {
    const { userId, limit: itemLimit = 100 } = options;
    
    try {
      // Get plans from Firebase
      let fbQuery = collection(db, 'daily_plans');
      
      // Apply user ID filter if provided
      if (userId) {
        fbQuery = query(fbQuery, where('user_id', '==', userId));
      }
      
      // Apply sorting and limit
      fbQuery = query(fbQuery, orderBy('date', 'desc'), limit(itemLimit));
      
      // Get documents
      const fbQuerySnapshot = await getDocs(fbQuery);
      
      // Extract plans
      const fbPlans = [];
      fbQuerySnapshot.forEach((doc) => {
        fbPlans.push({
          id: doc.id,
          firebase_id: doc.id,
          ...doc.data()
        });
      });
      
      // Update progress
      this.setProgress(0, fbPlans.length, 'plans', 'Fetching plans from API');
      
      // Get plans from API
      const apiPlans = await api.get('/planning', {
        params: { 
          user_id: userId,
          limit: itemLimit
        }
      }).then(response => response.data);
      
      // Create lookup for API plans by firebase_id
      const apiPlansByFirebaseId = {};
      apiPlans.forEach(plan => {
        if (plan.firebase_id) {
          apiPlansByFirebaseId[plan.firebase_id] = plan;
        }
      });
      
      // Select sample plans for detailed validation
      const sampleSize = Math.min(fbPlans.length, 20);
      const sampleIndices = this.getRandomIndices(fbPlans.length, sampleSize);
      const samplePlans = sampleIndices.map(index => fbPlans[index]);
      
      // Validate each sample plan
      this.validationResults.plans.total = samplePlans.length;
      
      for (let i = 0; i < samplePlans.length; i++) {
        const fbPlan = samplePlans[i];
        const apiPlan = apiPlansByFirebaseId[fbPlan.firebase_id];
        
        if (!apiPlan) {
          // Plan not found in API
          this.validationResults.plans.failed++;
          this.validationResults.plans.details.push({
            id: fbPlan.id,
            firebase_id: fbPlan.firebase_id,
            status: 'failed',
            reason: 'Plan not found in API'
          });
        } else {
          // Validate plan fields
          const validationResult = this.validatePlanFields(fbPlan, apiPlan);
          
          if (validationResult.valid) {
            this.validationResults.plans.validated++;
            this.validationResults.plans.details.push({
              id: fbPlan.id,
              firebase_id: fbPlan.firebase_id,
              api_id: apiPlan.id,
              status: 'validated'
            });
          } else {
            this.validationResults.plans.failed++;
            this.validationResults.plans.details.push({
              id: fbPlan.id,
              firebase_id: fbPlan.firebase_id,
              api_id: apiPlan.id,
              status: 'failed',
              reason: validationResult.reason,
              differences: validationResult.differences
            });
          }
        }
        
        // Update progress
        this.setProgress(i + 1, samplePlans.length, 'plans', 'Validating plans');
      }
      
      return this.validationResults.plans;
    } catch (error) {
      console.error('Error validating plans:', error);
      throw error;
    }
  }
  
  /**
   * Validate journal entries migration
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} - Validation results
   */
  async validateJournals(options = {}) {
    const { userId, limit: itemLimit = 100 } = options;
    
    try {
      // Get journals from Firebase
      let fbQuery = collection(db, 'journals');
      
      // Apply user ID filter if provided
      if (userId) {
        fbQuery = query(fbQuery, where('user_id', '==', userId));
      }
      
      // Apply sorting and limit
      fbQuery = query(fbQuery, orderBy('date', 'desc'), limit(itemLimit));
      
      // Get documents
      const fbQuerySnapshot = await getDocs(fbQuery);
      
      // Extract journals
      const fbJournals = [];
      fbQuerySnapshot.forEach((doc) => {
        fbJournals.push({
          id: doc.id,
          firebase_id: doc.id,
          ...doc.data()
        });
      });
      
      // Check if any journals exist
      if (fbJournals.length === 0) {
        this.validationResults.journals.total = 0;
        return this.validationResults.journals;
      }
      
      // Update progress
      this.setProgress(0, fbJournals.length, 'journals', 'Fetching journals from API');
      
      // Get journals from API
      const apiJournals = await api.get('/journals', {
        params: { 
          user_id: userId,
          limit: itemLimit
        }
      }).then(response => response.data);
      
      // Create lookup for API journals by firebase_id
      const apiJournalsByFirebaseId = {};
      apiJournals.forEach(journal => {
        if (journal.firebase_id) {
          apiJournalsByFirebaseId[journal.firebase_id] = journal;
        }
      });
      
      // Select sample journals for detailed validation
      const sampleSize = Math.min(fbJournals.length, 20);
      const sampleIndices = this.getRandomIndices(fbJournals.length, sampleSize);
      const sampleJournals = sampleIndices.map(index => fbJournals[index]);
      
      // Validate each sample journal
      this.validationResults.journals.total = sampleJournals.length;
      
      for (let i = 0; i < sampleJournals.length; i++) {
        const fbJournal = sampleJournals[i];
        const apiJournal = apiJournalsByFirebaseId[fbJournal.firebase_id];
        
        if (!apiJournal) {
          // Journal not found in API
          this.validationResults.journals.failed++;
          this.validationResults.journals.details.push({
            id: fbJournal.id,
            firebase_id: fbJournal.firebase_id,
            status: 'failed',
            reason: 'Journal not found in API'
          });
        } else {
          // Validate journal fields
          const validationResult = this.validateJournalFields(fbJournal, apiJournal);
          
          if (validationResult.valid) {
            this.validationResults.journals.validated++;
            this.validationResults.journals.details.push({
              id: fbJournal.id,
              firebase_id: fbJournal.firebase_id,
              api_id: apiJournal.id,
              status: 'validated'
            });
          } else {
            this.validationResults.journals.failed++;
            this.validationResults.journals.details.push({
              id: fbJournal.id,
              firebase_id: fbJournal.firebase_id,
              api_id: apiJournal.id,
              status: 'failed',
              reason: validationResult.reason,
              differences: validationResult.differences
            });
          }
        }
        
        // Update progress
        this.setProgress(i + 1, sampleJournals.length, 'journals', 'Validating journals');
      }
      
      return this.validationResults.journals;
    } catch (error) {
      console.error('Error validating journals:', error);
      throw error;
    }
  }
  
  /**
   * Validate all entity migrations
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} - Validation results
   */
  async validateAll(options = {}) {
    try {
      // Reset validation results
      this.reset();
      
      // Validate trades
      await this.validateTrades(options);
      
      // Validate plans
      await this.validatePlans(options);
      
      // Validate journals
      await this.validateJournals(options);
      
      return this.validationResults;
    } catch (error) {
      console.error('Error validating migration:', error);
      throw error;
    }
  }
  
  /**
   * Validate trade fields
   * @param {Object} fbTrade - Firebase trade
   * @param {Object} apiTrade - API trade
   * @returns {Object} - Validation result
   */
  validateTradeFields(fbTrade, apiTrade) {
    const differences = [];
    
    // Fields to validate (with transformations if needed)
    const fieldsToValidate = [
      { fb: 'symbol', api: 'symbol' },
      { fb: 'setup_type', api: 'setup_type' },
      { fb: 'entry_price', api: 'entry_price' },
      { fb: 'exit_price', api: 'exit_price' },
      { fb: 'position_size', api: 'position_size' },
      { 
        fb: 'entry_time', 
        api: 'entry_time',
        transform: (value) => {
          // Handle Firebase timestamp
          if (value?.seconds) {
            return new Date(value.seconds * 1000).toISOString();
          }
          // Handle ISO string
          if (typeof value === 'string') {
            return new Date(value).toISOString();
          }
          return value;
        }
      },
      { 
        fb: 'exit_time', 
        api: 'exit_time',
        transform: (value) => {
          // Handle Firebase timestamp
          if (value?.seconds) {
            return new Date(value.seconds * 1000).toISOString();
          }
          // Handle ISO string
          if (typeof value === 'string') {
            return new Date(value).toISOString();
          }
          return value;
        }
      },
      { fb: 'outcome', api: 'outcome' },
      { fb: 'profit_loss', api: 'profit_loss' },
      { fb: 'notes', api: 'notes' },
      { fb: 'user_id', api: 'user_id' }
    ];
    
    // Validate each field
    fieldsToValidate.forEach(field => {
      // Get values (with transformation if provided)
      const fbValue = field.transform ? 
        field.transform(fbTrade[field.fb]) : 
        fbTrade[field.fb];
      
      const apiValue = field.transform ? 
        field.transform(apiTrade[field.api]) : 
        apiTrade[field.api];
      
      // Compare values
      if (this.compareValues(fbValue, apiValue) === false) {
        differences.push({
          field: field.fb,
          fbValue,
          apiValue
        });
      }
    });
    
    // Special handling for arrays and objects
    // Tags
    if (fbTrade.tags && apiTrade.tags) {
      if (!this.compareArrays(fbTrade.tags, apiTrade.tags)) {
        differences.push({
          field: 'tags',
          fbValue: fbTrade.tags,
          apiValue: apiTrade.tags
        });
      }
    }
    
    // Screenshots
    if (fbTrade.screenshots && apiTrade.screenshots) {
      // Compare array lengths
      if (fbTrade.screenshots.length !== apiTrade.screenshots.length) {
        differences.push({
          field: 'screenshots',
          fbValue: fbTrade.screenshots,
          apiValue: apiTrade.screenshots
        });
      }
    }
    
    // Return validation result
    return {
      valid: differences.length === 0,
      reason: differences.length > 0 ? 'Field differences detected' : '',
      differences
    };
  }
  
  /**
   * Validate plan fields
   * @param {Object} fbPlan - Firebase plan
   * @param {Object} apiPlan - API plan
   * @returns {Object} - Validation result
   */
  validatePlanFields(fbPlan, apiPlan) {
    const differences = [];
    
    // Fields to validate (with transformations if needed)
    const fieldsToValidate = [
      { fb: 'market_bias', api: 'market_bias' },
      { fb: 'goals', api: 'goals' },
      { fb: 'mental_state', api: 'mental_state' },
      { fb: 'notes', api: 'notes' },
      { fb: 'user_id', api: 'user_id' },
      { 
        fb: 'date', 
        api: 'date',
        transform: (value) => {
          // Handle Firebase timestamp
          if (value?.seconds) {
            return new Date(value.seconds * 1000).toISOString().split('T')[0];
          }
          // Handle ISO string
          if (typeof value === 'string') {
            return new Date(value).toISOString().split('T')[0];
          }
          return value;
        }
      }
    ];
    
    // Validate each field
    fieldsToValidate.forEach(field => {
      // Get values (with transformation if provided)
      const fbValue = field.transform ? 
        field.transform(fbPlan[field.fb]) : 
        fbPlan[field.fb];
      
      const apiValue = field.transform ? 
        field.transform(apiPlan[field.api]) : 
        apiPlan[field.api];
      
      // Compare values
      if (this.compareValues(fbValue, apiValue) === false) {
        differences.push({
          field: field.fb,
          fbValue,
          apiValue
        });
      }
    });
    
    // Special handling for arrays and objects
    // Key levels
    if (fbPlan.key_levels && apiPlan.key_levels) {
      if (!this.compareKeyLevels(fbPlan.key_levels, apiPlan.key_levels)) {
        differences.push({
          field: 'key_levels',
          fbValue: fbPlan.key_levels,
          apiValue: apiPlan.key_levels
        });
      }
    }
    
    // Risk parameters
    if (fbPlan.risk_parameters && apiPlan.risk_parameters) {
      if (!this.compareObjects(fbPlan.risk_parameters, apiPlan.risk_parameters)) {
        differences.push({
          field: 'risk_parameters',
          fbValue: fbPlan.risk_parameters,
          apiValue: apiPlan.risk_parameters
        });
      }
    }
    
    // Return validation result
    return {
      valid: differences.length === 0,
      reason: differences.length > 0 ? 'Field differences detected' : '',
      differences
    };
  }
  
  /**
   * Validate journal fields
   * @param {Object} fbJournal - Firebase journal
   * @param {Object} apiJournal - API journal
   * @returns {Object} - Validation result
   */
  validateJournalFields(fbJournal, apiJournal) {
    const differences = [];
    
    // Fields to validate (with transformations if needed)
    const fieldsToValidate = [
      { fb: 'content', api: 'content' },
      { fb: 'mood_rating', api: 'mood_rating' },
      { fb: 'insights', api: 'insights' },
      { fb: 'user_id', api: 'user_id' },
      { 
        fb: 'date', 
        api: 'date',
        transform: (value) => {
          // Handle Firebase timestamp
          if (value?.seconds) {
            return new Date(value.seconds * 1000).toISOString().split('T')[0];
          }
          // Handle ISO string
          if (typeof value === 'string') {
            return new Date(value).toISOString().split('T')[0];
          }
          return value;
        }
      }
    ];
    
    // Validate each field
    fieldsToValidate.forEach(field => {
      // Get values (with transformation if provided)
      const fbValue = field.transform ? 
        field.transform(fbJournal[field.fb]) : 
        fbJournal[field.fb];
      
      const apiValue = field.transform ? 
        field.transform(apiJournal[field.api]) : 
        apiJournal[field.api];
      
      // Compare values
      if (this.compareValues(fbValue, apiValue) === false) {
        differences.push({
          field: field.fb,
          fbValue,
          apiValue
        });
      }
    });
    
    // Special handling for arrays and objects
    // Tags
    if (fbJournal.tags && apiJournal.tags) {
      if (!this.compareArrays(fbJournal.tags, apiJournal.tags)) {
        differences.push({
          field: 'tags',
          fbValue: fbJournal.tags,
          apiValue: apiJournal.tags
        });
      }
    }
    
    // Related trade IDs
    if (fbJournal.related_trade_ids && apiJournal.related_trade_ids) {
      if (!this.compareArrays(fbJournal.related_trade_ids, apiJournal.related_trade_ids)) {
        differences.push({
          field: 'related_trade_ids',
          fbValue: fbJournal.related_trade_ids,
          apiValue: apiJournal.related_trade_ids
        });
      }
    }
    
    // Return validation result
    return {
      valid: differences.length === 0,
      reason: differences.length > 0 ? 'Field differences detected' : '',
      differences
    };
  }
  
  /**
   * Compare key levels arrays
   * @param {Array} fbKeyLevels - Firebase key levels
   * @param {Array} apiKeyLevels - API key levels
   * @returns {boolean} - Whether arrays are equal
   */
  compareKeyLevels(fbKeyLevels, apiKeyLevels) {
    // Check if arrays have the same length
    if (fbKeyLevels.length !== apiKeyLevels.length) {
      return false;
    }
    
    // Create copies for sorting
    const fbSorted = [...fbKeyLevels].sort((a, b) => a.price - b.price);
    const apiSorted = [...apiKeyLevels].sort((a, b) => a.price - b.price);
    
    // Compare each key level
    for (let i = 0; i < fbSorted.length; i++) {
      const fbLevel = fbSorted[i];
      const apiLevel = apiSorted[i];
      
      // Compare price
      if (fbLevel.price !== apiLevel.price) {
        return false;
      }
      
      // Compare type
      if (fbLevel.type !== apiLevel.type) {
        return false;
      }
      
      // Compare note (if present)
      if (fbLevel.note !== apiLevel.note) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Compare arrays
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {boolean} - Whether arrays are equal
   */
  compareArrays(arr1, arr2) {
    // Check if arrays have the same length
    if (arr1.length !== arr2.length) {
      return false;
    }
    
    // Create copies for sorting
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    
    // Compare each element
    for (let i = 0; i < sorted1.length; i++) {
      if (sorted1[i] !== sorted2[i]) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Compare objects
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {boolean} - Whether objects are equal
   */
  compareObjects(obj1, obj2) {
    // Get keys from both objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    // Check if objects have the same number of keys
    if (keys1.length !== keys2.length) {
      return false;
    }
    
    // Compare each key-value pair
    for (const key of keys1) {
      // Check if key exists in both objects
      if (!obj2.hasOwnProperty(key)) {
        return false;
      }
      
      // Compare values
      if (this.compareValues(obj1[key], obj2[key]) === false) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Compare values
   * @param {any} val1 - First value
   * @param {any} val2 - Second value
   * @returns {boolean} - Whether values are equal
   */
  compareValues(val1, val2) {
    // Handle null/undefined
    if (val1 === null || val1 === undefined) {
      return val2 === null || val2 === undefined;
    }
    
    // Handle different types
    if (typeof val1 !== typeof val2) {
      // Special case for numbers
      if (typeof val1 === 'number' && typeof val2 === 'string') {
        return val1 === parseFloat(val2);
      }
      
      if (typeof val1 === 'string' && typeof val2 === 'number') {
        return parseFloat(val1) === val2;
      }
      
      return false;
    }
    
    // Handle arrays
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return this.compareArrays(val1, val2);
    }
    
    // Handle objects
    if (typeof val1 === 'object' && typeof val2 === 'object') {
      return this.compareObjects(val1, val2);
    }
    
    // Handle dates
    if (val1 instanceof Date && val2 instanceof Date) {
      return val1.getTime() === val2.getTime();
    }
    
    // Handle primitive values
    return val1 === val2;
  }
  
  /**
   * Get random indices for sampling
   * @param {number} max - Maximum index
   * @param {number} count - Number of indices to generate
   * @returns {Array<number>} - Random indices
   */
  getRandomIndices(max, count) {
    const indices = [];
    
    // If count is greater than max, return all indices
    if (count >= max) {
      for (let i = 0; i < max; i++) {
        indices.push(i);
      }
      return indices;
    }
    
    // Generate random indices
    while (indices.length < count) {
      const randomIndex = Math.floor(Math.random() * max);
      
      // Check if index is already in array
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    
    return indices;
  }
  
  /**
   * Create validation report
   * @returns {string} - Validation report
   */
  createValidationReport() {
    let report = '# Migration Validation Report\n\n';
    
    // Add trades report
    report += '## Trades\n\n';
    report += `- Total validated: ${this.validationResults.trades.validated}/${this.validationResults.trades.total}\n`;
    report += `- Failed: ${this.validationResults.trades.failed}\n\n`;
    
    if (this.validationResults.trades.failed > 0) {
      report += '### Failed Trade Validations\n\n';
      
      this.validationResults.trades.details
        .filter(detail => detail.status === 'failed')
        .forEach(detail => {
          report += `- ID: ${detail.id}, Reason: ${detail.reason}\n`;
          
          if (detail.differences) {
            report += '  - Differences:\n';
            detail.differences.forEach(diff => {
              report += `    - Field: ${diff.field}, Firebase: ${JSON.stringify(diff.fbValue)}, API: ${JSON.stringify(diff.apiValue)}\n`;
            });
          }
          
          report += '\n';
        });
    }
    
    // Add plans report
    report += '## Daily Plans\n\n';
    report += `- Total validated: ${this.validationResults.plans.validated}/${this.validationResults.plans.total}\n`;
    report += `- Failed: ${this.validationResults.plans.failed}\n\n`;
    
    if (this.validationResults.plans.failed > 0) {
      report += '### Failed Plan Validations\n\n';
      
      this.validationResults.plans.details
        .filter(detail => detail.status === 'failed')
        .forEach(detail => {
          report += `- ID: ${detail.id}, Reason: ${detail.reason}\n`;
          
          if (detail.differences) {
            report += '  - Differences:\n';
            detail.differences.forEach(diff => {
              report += `    - Field: ${diff.field}, Firebase: ${JSON.stringify(diff.fbValue)}, API: ${JSON.stringify(diff.apiValue)}\n`;
            });
          }
          
          report += '\n';
        });
    }
    
    // Add journals report
    report += '## Journal Entries\n\n';
    report += `- Total validated: ${this.validationResults.journals.validated}/${this.validationResults.journals.total}\n`;
    report += `- Failed: ${this.validationResults.journals.failed}\n\n`;
    
    if (this.validationResults.journals.failed > 0) {
      report += '### Failed Journal Validations\n\n';
      
      this.validationResults.journals.details
        .filter(detail => detail.status === 'failed')
        .forEach(detail => {
          report += `- ID: ${detail.id}, Reason: ${detail.reason}\n`;
          
          if (detail.differences) {
            report += '  - Differences:\n';
            detail.differences.forEach(diff => {
              report += `    - Field: ${diff.field}, Firebase: ${JSON.stringify(diff.fbValue)}, API: ${JSON.stringify(diff.apiValue)}\n`;
            });
          }
          
          report += '\n';
        });
    }
    
    report += '\n## Validation Summary\n\n';
    const totalValidated = 
      this.validationResults.trades.validated + 
      this.validationResults.plans.validated + 
      this.validationResults.journals.validated;
    
    const totalFailed = 
      this.validationResults.trades.failed + 
      this.validationResults.plans.failed + 
      this.validationResults.journals.failed;
    
    const totalItems = 
      this.validationResults.trades.total + 
      this.validationResults.plans.total + 
      this.validationResults.journals.total;
    
    report += `- Total items validated: ${totalValidated}/${totalItems}\n`;
    report += `- Total failed: ${totalFailed}\n`;
    report += `- Validation success rate: ${((totalValidated / totalItems) * 100).toFixed(2)}%\n`;
    
    return report;
  }
}

// Export MigrationValidation class
export default new MigrationValidation();
