import React, { createContext, useState, useContext, useEffect } from 'react';
import { endpoints } from '../services/api';

// Create auth context
const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user from local storage
  useEffect(() => {
    const getUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (err) {
        console.error("Error loading user from storage:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await endpoints.auth.login(credentials);
      const { user, token } = response.data;
      
      // Store in local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setUser(user);
      return user;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await endpoints.auth.register(userData);
      return response.data;
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Call backend logout (optional)
    try {
      endpoints.auth.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Update user function
  const updateUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      const response = await endpoints.users.update(user.id, userData);
      const updatedUser = response.data;
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error("Update user error:", err);
      setError(err.response?.data?.detail || 'Update failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
