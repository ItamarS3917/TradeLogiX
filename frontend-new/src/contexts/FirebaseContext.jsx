// FirebaseContext.jsx
// A centralized context for Firebase services and data

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  db, collection, doc, addDoc, getDoc, getDocs, 
  updateDoc, deleteDoc, query, where, orderBy, limit,
  app, analytics, setDoc
} from '../config/firebase';
import { useAuth } from './AuthContext'; // Use regular auth context during transition
import { format } from 'date-fns';

// Create the context
const FirebaseContext = createContext(null);

// Custom hook to use Firebase
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Firebase Provider component
export const FirebaseProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Use regular auth context

  useEffect(() => {
    // Check if Firebase is initialized
    if (db) {
      console.log('Firebase initialized successfully');
      setInitialized(true);
    } else {
      console.error('Firebase initialization failed');
      setError('Failed to initialize Firebase');
    }
  }, []);

  // ====== TRADES COLLECTION OPERATIONS ======
  
  // Get all trades with optional filters
  const getAllTrades = async (filters = {}) => {
    try {
      console.log('Getting all trades with filters:', filters);
      let q = collection(db, 'trades');
      
      // Apply user ID filter if authenticated
      if (user?.id) {
        console.log('Filtering trades by user ID:', user.id);
        q = query(q, where('user_id', '==', user.id));
      } else {
        console.warn('No user ID available - showing all trades');
      }
      
      // Get documents without complex filtering for now
      // This avoids the need for composite indexes during development
      const querySnapshot = await getDocs(q);
      
      // Map documents to trade objects
      let trades = [];
      querySnapshot.forEach((doc) => {
        trades.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Apply manual filtering for other filters
      if (filters.symbol) {
        trades = trades.filter(trade => trade.symbol === filters.symbol);
      }
      
      if (filters.setupType && filters.setupType !== 'All') {
        trades = trades.filter(trade => trade.setup_type === filters.setupType);
      }
      
      if (filters.outcome && filters.outcome !== 'All') {
        trades = trades.filter(trade => trade.outcome === filters.outcome);
      }
      
      // Apply date filters
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        trades = trades.filter(trade => new Date(trade.entry_time) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        trades = trades.filter(trade => new Date(trade.entry_time) <= endDate);
      }
      
      // Apply sorting manually
      trades.sort((a, b) => new Date(b.entry_time) - new Date(a.entry_time));
      
      // Apply limit
      if (filters.limit) {
        trades = trades.slice(0, parseInt(filters.limit));
      }
      
      console.log(`Retrieved ${trades.length} trades`);
      return trades;
    } catch (error) {
      console.error('Error getting trades:', error);
      throw error;
    }
  };

  // Get trade by ID
  const getTradeById = async (id) => {
    try {
      console.log(`Getting trade with ID: ${id}`);
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
      console.error('Error getting trade by ID:', error);
      throw error;
    }
  };

  // Create a new trade
  const createTrade = async (tradeData) => {
    try {
      console.log('Creating new trade:', tradeData);
      // Add timestamps and user ID
      const dataWithTimestamps = {
        ...tradeData,
        user_id: user?.id || 'anonymous', // Use authenticated user ID or anonymous
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Ensure entry_time and exit_time are Date objects
      if (typeof dataWithTimestamps.entry_time === 'string') {
        dataWithTimestamps.entry_time = new Date(dataWithTimestamps.entry_time);
      }
      
      if (typeof dataWithTimestamps.exit_time === 'string') {
        dataWithTimestamps.exit_time = new Date(dataWithTimestamps.exit_time);
      }
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'trades'), dataWithTimestamps);
      
      // Get the created document
      const docSnap = await getDoc(docRef);
      
      console.log(`Trade created with ID: ${docRef.id}`);
      return {
        id: docRef.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error creating trade:', error);
      throw error;
    }
  };

  // Update an existing trade
  const updateTrade = async (id, tradeData) => {
    try {
      console.log(`Updating trade with ID: ${id}`);
      const docRef = doc(db, 'trades', id);
      
      // Add updated timestamp
      const dataWithTimestamp = {
        ...tradeData,
        updated_at: new Date()
      };
      
      // Update document
      await updateDoc(docRef, dataWithTimestamp);
      
      // Get updated document
      const docSnap = await getDoc(docRef);
      
      console.log(`Trade updated successfully`);
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  };

  // Delete a trade
  const deleteTrade = async (id) => {
    try {
      console.log(`Deleting trade with ID: ${id}`);
      const docRef = doc(db, 'trades', id);
      await deleteDoc(docRef);
      console.log('Trade deleted successfully');
      return { detail: "Trade deleted successfully" };
    } catch (error) {
      console.error('Error deleting trade:', error);
      throw error;
    }
  };

  // ====== DAILY PLANS COLLECTION OPERATIONS ======
  
  // Get all daily plans with optional filters
  const getAllDailyPlans = async (filters = {}) => {
    try {
      console.log('Getting all daily plans with filters:', filters);
      let q = collection(db, 'daily_plans');
      
      // Apply user ID filter if authenticated
      if (user?.id) {
        console.log('Filtering daily plans by user ID:', user.id);
        q = query(q, where('user_id', '==', user.id));
      } else {
        console.warn('No user ID available - showing all daily plans');
      }
      
      // Get documents without complex filtering for now
      const querySnapshot = await getDocs(q);
      
      // Map documents to plan objects
      let plans = [];
      querySnapshot.forEach((doc) => {
        plans.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Apply date filters manually
      if (filters.start_date) {
        const startDate = new Date(filters.start_date);
        plans = plans.filter(plan => {
          const planDate = new Date(plan.date.seconds * 1000); // Handle Firestore timestamps
          return planDate >= startDate;
        });
      }
      
      if (filters.end_date) {
        const endDate = new Date(filters.end_date);
        plans = plans.filter(plan => {
          const planDate = new Date(plan.date.seconds * 1000); // Handle Firestore timestamps
          return planDate <= endDate;
        });
      }
      
      // Apply sorting manually
      plans.sort((a, b) => {
        const dateA = new Date(a.date.seconds * 1000);
        const dateB = new Date(b.date.seconds * 1000);
        return dateB - dateA; // descending order
      });
      
      console.log(`Retrieved ${plans.length} daily plans`);
      return plans;
    } catch (error) {
      console.error('Error getting daily plans:', error);
      throw error;
    }
  };

  // Get daily plan by date
  const getDailyPlanByDate = async (dateStr) => {
    try {
      console.log(`Getting daily plan for date: ${dateStr}`);
      
      // Convert string date to date object
      const targetDate = new Date(dateStr);
      targetDate.setHours(0, 0, 0, 0);
      
      // Get all plans for the user
      let q = collection(db, 'daily_plans');
      
      // Apply user ID filter if authenticated
      if (user?.id) {
        q = query(q, where('user_id', '==', user.id));
      }
      
      const querySnapshot = await getDocs(q);
      
      // Find the plan that matches the date
      let matchingPlan = null;
      querySnapshot.forEach((doc) => {
        const plan = {
          id: doc.id,
          ...doc.data()
        };
        
        // Handle Firestore timestamps
        const planDate = plan.date?.seconds ? new Date(plan.date.seconds * 1000) : new Date(plan.date);
        planDate.setHours(0, 0, 0, 0); // Remove time component for comparison
        
        if (planDate.getTime() === targetDate.getTime()) {
          matchingPlan = plan;
        }
      });
      
      if (!matchingPlan) {
        console.log('No daily plan found for this date');
        return null;
      }
      
      console.log(`Found daily plan with ID: ${matchingPlan.id}`);
      return matchingPlan;
    } catch (error) {
      console.error('Error getting daily plan by date:', error);
      throw error;
    }
  };

  // Create a new daily plan
  const createDailyPlan = async (planData) => {
    try {
      console.log('Creating new daily plan:', planData);
      
      // Ensure date is a Date object
      let dataWithDate = { ...planData };
      if (typeof dataWithDate.date === 'string') {
        dataWithDate.date = new Date(dataWithDate.date);
      }
      
      // Add timestamps and user ID
      dataWithDate = {
        ...dataWithDate,
        user_id: user?.id || 'anonymous', // Use authenticated user ID or anonymous
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'daily_plans'), dataWithDate);
      
      // Get the created document
      const docSnap = await getDoc(docRef);
      
      console.log(`Daily plan created with ID: ${docRef.id}`);
      return {
        id: docRef.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error creating daily plan:', error);
      throw error;
    }
  };

  // Update an existing daily plan
  const updateDailyPlan = async (id, planData) => {
    try {
      console.log(`Updating daily plan with ID: ${id}`);
      const docRef = doc(db, 'daily_plans', id);
      
      // Add updated timestamp
      const dataWithTimestamp = {
        ...planData,
        updated_at: new Date()
      };
      
      // Update document
      await updateDoc(docRef, dataWithTimestamp);
      
      // Get updated document
      const docSnap = await getDoc(docRef);
      
      console.log(`Daily plan updated successfully`);
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error updating daily plan:', error);
      throw error;
    }
  };

  // Delete a daily plan
  const deleteDailyPlan = async (id) => {
    try {
      console.log(`Deleting daily plan with ID: ${id}`);
      const docRef = doc(db, 'daily_plans', id);
      await deleteDoc(docRef);
      console.log('Daily plan deleted successfully');
      return { detail: "Daily plan deleted successfully" };
    } catch (error) {
      console.error('Error deleting daily plan:', error);
      throw error;
    }
  };

  // ====== JOURNAL COLLECTION OPERATIONS ======
  
  // Get all journal entries with optional filters
  const getAllJournalEntries = async (filters = {}) => {
    try {
      console.log('Getting journal entries with filters:', filters);
      let q = collection(db, 'journals');
      
      // Apply user ID filter if authenticated
      if (user?.id) {
        q = query(q, where('user_id', '==', user.id));
      }
      
      // Apply date filters
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        q = query(q, where('date', '>=', startDate));
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        q = query(q, where('date', '<=', endDate));
      }
      
      // Apply sorting
      q = query(q, orderBy('date', 'desc'));
      
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
      
      console.log(`Retrieved ${journals.length} journal entries`);
      return journals;
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw error;
    }
  };

  // Provide the services through context
  const value = {
    // Firebase instance status
    initialized,
    error,
    
    // User
    currentUser: user,
    
    // Firebase instances
    db,
    app,
    analytics,
    
    // Firestore methods for direct access
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    
    // Trade operations
    getAllTrades,
    getTradeById,
    createTrade,
    updateTrade,
    deleteTrade,
    
    // Daily plan operations
    getAllDailyPlans,
    getDailyPlanByDate,
    createDailyPlan,
    updateDailyPlan,
    deleteDailyPlan,
    
    // Journal operations
    getAllJournalEntries
  };

  return (
    <FirebaseContext.Provider value={value}>
      {error ? (
        <div style={{ padding: '20px', color: 'red' }}>
          Firebase Error: {error}
        </div>
      ) : (
        children
      )}
    </FirebaseContext.Provider>
  );
};
