// File: planningService.js
// Purpose: Firebase Firestore service for daily plans

import { 
  db, collection, doc, addDoc, getDoc, getDocs, 
  updateDoc, deleteDoc, query, where, orderBy, limit 
} from '../../config/firebase';

// Collection reference
const plansCollection = collection(db, 'daily_plans');

// Create a service object that matches the API service interface
const planningService = {
  /**
   * Get all daily plans
   * @param {Object} params - Query parameters
   * @returns {Promise} - Array of plans
   */
  getAllDailyPlans: async (params = {}) => {
    try {
      let q = plansCollection;
      
      // Apply filters
      if (params.userId) {
        q = query(q, where('user_id', '==', params.userId));
      }
      
      // Apply sorting (by date descending)
      q = query(q, orderBy('date', 'desc'));
      
      // Apply limit
      if (params.limit) {
        q = query(q, limit(params.limit));
      }
      
      // Get documents
      const querySnapshot = await getDocs(q);
      
      // Map documents to plan objects
      const plans = [];
      querySnapshot.forEach((doc) => {
        plans.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return plans;
    } catch (error) {
      console.error('Error getting plans:', error);
      throw error;
    }
  },

  /**
   * Get daily plan by ID
   * @param {string} id - Plan ID
   * @returns {Promise} - Plan object
   */
  getDailyPlanById: async (id) => {
    try {
      const docRef = doc(db, 'daily_plans', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Plan not found');
      }
    } catch (error) {
      console.error('Error getting plan:', error);
      throw error;
    }
  },

  /**
   * Get daily plan by date
   * @param {string} date - Date in ISO format
   * @returns {Promise} - Plan object
   */
  getDailyPlanByDate: async (date) => {
    try {
      // Convert ISO date string to date object if needed
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Create a query with date filter
      const q = query(
        plansCollection, 
        where('date', '==', dateObj)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error getting plan by date:', error);
      throw error;
    }
  },

  /**
   * Create new daily plan
   * @param {Object} planData - Daily plan data
   * @returns {Promise} - Created plan object
   */
  createDailyPlan: async (planData) => {
    try {
      const docRef = await addDoc(plansCollection, {
        ...planData,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // Get the created document
      const docSnap = await getDoc(docRef);
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  },

  /**
   * Update existing daily plan
   * @param {string} id - Plan ID
   * @param {Object} planData - Updated plan data
   * @returns {Promise} - Updated plan object
   */
  updateDailyPlan: async (id, planData) => {
    try {
      const docRef = doc(db, 'daily_plans', id);
      
      // Update document
      await updateDoc(docRef, {
        ...planData,
        updated_at: new Date()
      });
      
      // Get updated document
      const docSnap = await getDoc(docRef);
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  },

  /**
   * Delete daily plan
   * @param {string} id - Plan ID
   * @returns {Promise} - Success message
   */
  deleteDailyPlan: async (id) => {
    try {
      const docRef = doc(db, 'daily_plans', id);
      await deleteDoc(docRef);
      return { detail: "Plan deleted successfully" };
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  },

  /**
   * Get today's plan
   * @returns {Promise} - Today's plan object
   */
  getTodaysPlan: async () => {
    try {
      // Get today's date (reset to midnight)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Query for today's plan
      const q = query(
        plansCollection, 
        where('date', '==', today)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error getting today\'s plan:', error);
      throw error;
    }
  },

  /**
   * Get plans by market bias
   * @param {string} bias - Market bias to filter by
   * @returns {Promise} - Array of plans
   */
  getPlansByMarketBias: async (bias) => {
    try {
      const q = query(
        plansCollection, 
        where('market_bias', '==', bias)
      );
      
      const querySnapshot = await getDocs(q);
      
      const plans = [];
      querySnapshot.forEach((doc) => {
        plans.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return plans;
    } catch (error) {
      console.error('Error getting plans by market bias:', error);
      throw error;
    }
  },

  /**
   * Add key level to daily plan
   * @param {string} planId - Plan ID
   * @param {Object} levelData - Key level data
   * @returns {Promise} - Updated plan with new level
   */
  addKeyLevel: async (planId, levelData) => {
    try {
      const docRef = doc(db, 'daily_plans', planId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Plan not found');
      }
      
      const planData = docSnap.data();
      const keyLevels = planData.key_levels || [];
      
      // Create a new level with ID
      const newLevel = {
        id: Date.now().toString(), // Simple ID generation
        ...levelData,
        created_at: new Date()
      };
      
      // Add to key levels array
      keyLevels.push(newLevel);
      
      // Update the document
      await updateDoc(docRef, {
        key_levels: keyLevels,
        updated_at: new Date()
      });
      
      // Get updated document
      const updatedDocSnap = await getDoc(docRef);
      
      return {
        id: updatedDocSnap.id,
        ...updatedDocSnap.data()
      };
    } catch (error) {
      console.error('Error adding key level:', error);
      throw error;
    }
  },

  /**
   * Remove key level from daily plan
   * @param {string} planId - Plan ID
   * @param {string} levelId - Level ID
   * @returns {Promise} - Updated plan without the level
   */
  removeKeyLevel: async (planId, levelId) => {
    try {
      const docRef = doc(db, 'daily_plans', planId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Plan not found');
      }
      
      const planData = docSnap.data();
      const keyLevels = planData.key_levels || [];
      
      // Filter out the level to remove
      const updatedLevels = keyLevels.filter(level => level.id !== levelId);
      
      // Update the document
      await updateDoc(docRef, {
        key_levels: updatedLevels,
        updated_at: new Date()
      });
      
      // Get updated document
      const updatedDocSnap = await getDoc(docRef);
      
      return {
        id: updatedDocSnap.id,
        ...updatedDocSnap.data()
      };
    } catch (error) {
      console.error('Error removing key level:', error);
      throw error;
    }
  }
};

export default planningService;
