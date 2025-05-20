// File: journalService.js
// Purpose: Firebase Firestore service for journal entries

import { 
  db, collection, doc, addDoc, getDoc, getDocs, 
  updateDoc, deleteDoc, query, where, orderBy, limit 
} from '../../config/firebase';

// Collection reference
const journalsCollection = collection(db, 'journals');

// Create a service object that matches the API service interface
const journalService = {
  /**
   * Get all journal entries
   * @param {Object} params - Query parameters
   * @returns {Promise} - Array of journal entries
   */
  getAllJournalEntries: async (params = {}) => {
    try {
      let q = journalsCollection;
      
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
      
      // Map documents to journal objects
      const journals = [];
      querySnapshot.forEach((doc) => {
        journals.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return journals;
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw error;
    }
  },

  /**
   * Get journal entry by ID
   * @param {string} id - Journal entry ID
   * @returns {Promise} - Journal entry object
   */
  getJournalEntryById: async (id) => {
    try {
      const docRef = doc(db, 'journals', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Journal entry not found');
      }
    } catch (error) {
      console.error('Error getting journal entry:', error);
      throw error;
    }
  },

  /**
   * Create new journal entry
   * @param {Object} journalData - Journal entry data
   * @returns {Promise} - Created journal entry object
   */
  createJournalEntry: async (journalData) => {
    try {
      const docRef = await addDoc(journalsCollection, {
        ...journalData,
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
      console.error('Error creating journal entry:', error);
      throw error;
    }
  },

  /**
   * Update existing journal entry
   * @param {string} id - Journal entry ID
   * @param {Object} journalData - Updated journal entry data
   * @returns {Promise} - Updated journal entry object
   */
  updateJournalEntry: async (id, journalData) => {
    try {
      const docRef = doc(db, 'journals', id);
      
      // Update document
      await updateDoc(docRef, {
        ...journalData,
        updated_at: new Date()
      });
      
      // Get updated document
      const docSnap = await getDoc(docRef);
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  },

  /**
   * Delete journal entry
   * @param {string} id - Journal entry ID
   * @returns {Promise} - Success message
   */
  deleteJournalEntry: async (id) => {
    try {
      const docRef = doc(db, 'journals', id);
      await deleteDoc(docRef);
      return { detail: "Journal entry deleted successfully" };
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  },

  /**
   * Get journal entries by date
   * @param {string} date - Date in ISO format
   * @returns {Promise} - Array of journal entries
   */
  getJournalEntriesByDate: async (date) => {
    try {
      // Convert ISO date string to date object if needed
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Create a query with date filter
      const q = query(
        journalsCollection, 
        where('date', '==', dateObj)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Map documents to journal objects
      const journals = [];
      querySnapshot.forEach((doc) => {
        journals.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return journals;
    } catch (error) {
      console.error('Error getting journal entries by date:', error);
      throw error;
    }
  },

  /**
   * Get journal entries by tag
   * @param {string} tag - Tag to filter by
   * @returns {Promise} - Array of journal entries
   */
  getJournalEntriesByTag: async (tag) => {
    try {
      // For Firebase, we need to use the array-contains operator
      const q = query(
        journalsCollection, 
        where('tags', 'array-contains', tag)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Map documents to journal objects
      const journals = [];
      querySnapshot.forEach((doc) => {
        journals.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return journals;
    } catch (error) {
      console.error('Error getting journal entries by tag:', error);
      throw error;
    }
  },

  /**
   * Get journal entries by mood rating
   * @param {number} rating - Mood rating to filter by
   * @returns {Promise} - Array of journal entries
   */
  getJournalEntriesByMoodRating: async (rating) => {
    try {
      // Create a query with mood rating filter
      const q = query(
        journalsCollection, 
        where('mood_rating', '==', rating)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Map documents to journal objects
      const journals = [];
      querySnapshot.forEach((doc) => {
        journals.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return journals;
    } catch (error) {
      console.error('Error getting journal entries by mood rating:', error);
      throw error;
    }
  },

  /**
   * Search journal entries
   * @param {string} query - Search query
   * @returns {Promise} - Array of journal entries
   */
  searchJournalEntries: async (query) => {
    try {
      // Note: Firebase doesn't have built-in full-text search
      // This is a simple implementation that checks if the content contains the query
      // For production, consider using a specialized search service like Algolia

      // Get all documents
      const querySnapshot = await getDocs(journalsCollection);
      
      // Filter locally
      const journals = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const content = data.content || '';
        
        if (content.toLowerCase().includes(query.toLowerCase())) {
          journals.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      return journals;
    } catch (error) {
      console.error('Error searching journal entries:', error);
      throw error;
    }
  }
};

export default journalService;
