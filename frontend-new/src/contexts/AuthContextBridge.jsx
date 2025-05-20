import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import api from '../services/api';
import { getDataSourceMode } from '../services/serviceFactory';

// Create context
const AuthContextBridge = createContext(null);

// Custom hook to use auth
export const useAuthBridge = () => {
  const context = useContext(AuthContextBridge);
  if (!context) {
    throw new Error('useAuthBridge must be used within an AuthBridgeProvider');
  }
  return context;
};

// Auth Provider component
export const AuthBridgeProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [authMode, setAuthMode] = useState(getDataSourceMode() === 'api' ? 'api' : 'firebase');
  
  useEffect(() => {
    // Update auth mode when data source mode changes
    const mode = getDataSourceMode();
    setAuthMode(mode === 'api' ? 'api' : 'firebase');
  }, [getDataSourceMode()]);

  // Initialize Firebase Auth if using Firebase or bridge mode
  useEffect(() => {
    if (authMode === 'firebase') {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          // Get user token for API requests
          currentUser.getIdToken(true).then((token) => {
            setAuthToken(token);
            
            // Set user with additional info
            setUser({
              id: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              photoURL: currentUser.photoURL,
              emailVerified: currentUser.emailVerified,
              provider: currentUser.providerData?.[0]?.providerId || 'unknown'
            });
            setLoading(false);
          }).catch((error) => {
            console.error('Error getting token:', error);
            setError(error.message);
            setLoading(false);
          });
        } else {
          setUser(null);
          setAuthToken(null);
          setLoading(false);
        }
      });

      return () => unsubscribe();
    } else {
      // Using API auth mode - check for existing token
      const storedToken = localStorage.getItem('api_auth_token');
      
      if (storedToken) {
        // Verify token with backend
        api.get('/auth/verify', {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
          .then(response => {
            setAuthToken(storedToken);
            setUser(response.data.user);
          })
          .catch(error => {
            console.error('Token verification failed:', error);
            localStorage.removeItem('api_auth_token');
            setUser(null);
            setAuthToken(null);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setUser(null);
        setAuthToken(null);
        setLoading(false);
      }
    }
  }, [authMode]);

  // Login with email/password
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      if (authMode === 'firebase') {
        // Firebase Auth
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // User is set by the onAuthStateChanged listener
        return userCredential.user;
      } else {
        // API Auth
        const response = await api.post('/auth/login', { email, password });
        
        // Save token and user
        const { token, user } = response.data;
        localStorage.setItem('api_auth_token', token);
        setAuthToken(token);
        setUser(user);
        
        return user;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setLoading(true);
      
      if (authMode === 'firebase') {
        // Firebase Auth
        const auth = getAuth();
        await firebaseSignOut(auth);
        
        // User is unset by the onAuthStateChanged listener
      } else {
        // API Auth
        await api.post('/auth/logout');
        
        // Clear token and user
        localStorage.removeItem('api_auth_token');
        setAuthToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get current user - synchronous check
  const getCurrentUser = () => {
    if (authMode === 'firebase') {
      // Firebase Auth
      const auth = getAuth();
      return auth.currentUser;
    } else {
      // API Auth - return stored user
      return user;
    }
  };

  // Register new user with email/password
  const register = async (email, password, name) => {
    try {
      setLoading(true);
      setError(null);
      
      if (authMode === 'firebase') {
        // Firebase Auth
        const auth = getAuth();
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile if name is provided
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        
        // User is set by the onAuthStateChanged listener
        return userCredential.user;
      } else {
        // API Auth
        const response = await api.post('/auth/register', { email, password, name });
        
        // Save token and user
        const { token, user } = response.data;
        localStorage.setItem('api_auth_token', token);
        setAuthToken(token);
        setUser(user);
        
        return user;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      if (authMode === 'firebase') {
        // Firebase Auth
        const auth = getAuth();
        const { sendPasswordResetEmail } = await import('firebase/auth');
        
        await sendPasswordResetEmail(auth, email);
      } else {
        // API Auth
        await api.post('/auth/reset-password', { email });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle auth mode (for testing)
  const toggleAuthMode = () => {
    setAuthMode(prevMode => prevMode === 'firebase' ? 'api' : 'firebase');
  };
  
  // Provide the authentication context value
  const value = {
    user,
    loading,
    error,
    authToken,
    authMode,
    login,
    logout,
    getCurrentUser,
    register,
    resetPassword,
    toggleAuthMode
  };

  return (
    <AuthContextBridge.Provider value={value}>
      {children}
    </AuthContextBridge.Provider>
  );
};

export default AuthBridgeProvider;
