// File: tradeService.js
// Purpose: Firebase Firestore service for trades

import { 
  db, collection, doc, addDoc, getDoc, getDocs, 
  updateDoc, deleteDoc, query, where, orderBy, limit 
} from '../../config/firebase';

// Collection reference
const tradesCollection = collection(db, 'trades');

// Create a service object that matches the API service interface
const tradeService = {
  /**
   * Get all trades
   * @param {Object} params - Query parameters
   * @returns {Promise} - Array of trades
   */
  getAllTrades: async (params = {}) => {
    try {
      let q = tradesCollection;
      
      // Apply filters
      if (params.userId) {
        q = query(q, where('user_id', '==', params.userId));
      }
      
      if (params.symbol) {
        q = query(q, where('symbol', '==', params.symbol));
      }
      
      // Apply sorting
      q = query(q, orderBy('entry_time', 'desc'));
      
      // Apply limit
      if (params.limit) {
        q = query(q, limit(params.limit));
      }
      
      // Get documents
      const querySnapshot = await getDocs(q);
      
      // Map documents to trade objects
      const trades = [];
      querySnapshot.forEach((doc) => {
        trades.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return trades;
    } catch (error) {
      console.error('Error getting trades:', error);
      throw error;
    }
  },

  /**
   * Get trade by ID
   * @param {string} id - Trade ID
   * @returns {Promise} - Trade object
   */
  getTradeById: async (id) => {
    try {
      const docRef = doc(db, 'trades', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Trade not found');
      }
    } catch (error) {
      console.error('Error getting trade:', error);
      throw error;
    }
  },

  /**
   * Create new trade
   * @param {Object} tradeData - Trade data
   * @returns {Promise} - Created trade object
   */
  createTrade: async (tradeData) => {
    try {
      const docRef = await addDoc(tradesCollection, {
        ...tradeData,
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
      console.error('Error creating trade:', error);
      throw error;
    }
  },

  /**
   * Update existing trade
   * @param {string} id - Trade ID
   * @param {Object} tradeData - Updated trade data
   * @returns {Promise} - Updated trade object
   */
  updateTrade: async (id, tradeData) => {
    try {
      const docRef = doc(db, 'trades', id);
      
      // Update document
      await updateDoc(docRef, {
        ...tradeData,
        updated_at: new Date()
      });
      
      // Get updated document
      const docSnap = await getDoc(docRef);
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  },

  /**
   * Delete trade
   * @param {string} id - Trade ID
   * @returns {Promise} - Success message
   */
  deleteTrade: async (id) => {
    try {
      const docRef = doc(db, 'trades', id);
      await deleteDoc(docRef);
      return { detail: "Trade deleted successfully" };
    } catch (error) {
      console.error('Error deleting trade:', error);
      throw error;
    }
  },

  /**
   * Get trades by date range
   * @param {string} startDate - Start date in ISO format
   * @param {string} endDate - End date in ISO format
   * @returns {Promise} - Array of trades
   */
  getTradesByDateRange: async (startDate, endDate) => {
    try {
      let q = tradesCollection;
      
      if (startDate) {
        q = query(q, where('entry_time', '>=', new Date(startDate)));
      }
      
      if (endDate) {
        q = query(q, where('entry_time', '<=', new Date(endDate)));
      }
      
      // Get documents
      const querySnapshot = await getDocs(q);
      
      // Map documents to trade objects
      const trades = [];
      querySnapshot.forEach((doc) => {
        trades.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return trades;
    } catch (error) {
      console.error('Error getting trades by date range:', error);
      throw error;
    }
  },

  /**
   * Get trades by setup type
   * @param {string} setupType - Setup type
   * @returns {Promise} - Array of trades
   */
  getTradesBySetupType: async (setupType) => {
    try {
      const q = query(tradesCollection, where('setup_type', '==', setupType));
      const querySnapshot = await getDocs(q);
      
      // Map documents to trade objects
      const trades = [];
      querySnapshot.forEach((doc) => {
        trades.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return trades;
    } catch (error) {
      console.error('Error getting trades by setup type:', error);
      throw error;
    }
  },

  /**
   * Upload trade screenshot (Firebase implementation)
   * @param {string} tradeId - Trade ID
   * @param {File} file - Screenshot file
   * @returns {Promise} - Updated trade with screenshot URL
   */
  uploadScreenshot: async (tradeId, file) => {
    try {
      // For Firebase implementation, this would typically use Firebase Storage
      // This is a placeholder that would need to be implemented with Firebase Storage
      console.warn('Firebase screenshot upload not fully implemented');
      
      // Placeholder URL
      const url = `https://firebasestorage.googleapis.com/placeholder-${tradeId}`;
      
      // Update trade with screenshot URL
      const docRef = doc(db, 'trades', tradeId);
      await updateDoc(docRef, {
        screenshots: [{url: url, timestamp: new Date()}],
        updated_at: new Date()
      });
      
      // Get updated document
      const docSnap = await getDoc(docRef);
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      throw error;
    }
  }
};

export default tradeService;
