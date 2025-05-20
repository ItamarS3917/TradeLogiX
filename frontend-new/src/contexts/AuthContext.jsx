// Firebase Authentication Context
import React, { createContext, useState, useEffect, useContext } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app, auth } from '../config/firebase';

// Create the authentication context
export const AuthContext = createContext(null);

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component - using Firebase Auth
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user data on initial render
  useEffect(() => {
    // Set up observer on auth state
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        // User is signed in
        setToken(firebaseUser.accessToken);
        setUser({
          id: firebaseUser.uid, // Use Firebase UID as user ID
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'Trading User'
        });
        console.log('User authenticated:', firebaseUser.uid);
      } else {
        // User is signed out
        setToken(null);
        setUser(null);
        console.log('No user authenticated');
      }
      setIsLoading(false);
    });
    
    // Clean up observer
    return () => unsubscribe();
  }, []);

  // Login function using Firebase
  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    try {
      console.log('Attempting to log in with Firebase Auth...');
      // Use Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function using Firebase
  const register = async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    try {
      console.log('Attempting to register with Firebase Auth...');
      // Use Firebase to create a new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registration successful', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function using Firebase
  const logout = async () => {
    try {
      console.log('Attempting to sign out...');
      await signOut(auth);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Context value
  const value = {
    token,
    user,
    isLoading,
    login,
    logout,
    register,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;