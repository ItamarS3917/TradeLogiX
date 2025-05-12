import React, { createContext, useState, useEffect, useContext } from 'react';

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

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user data on initial render or when token changes
  useEffect(() => {
    if (token) {
      // TODO: Replace with actual API call to get user data
      // Simulating user data fetch
      setTimeout(() => {
        setUser({
          id: '123',
          email: 'user@example.com',
          name: 'Test User'
        });
        setIsLoading(false);
      }, 500);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  // Login function
  const login = async (email, password) => {
    // TODO: Replace with actual API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulating successful login
        const newToken = 'test-auth-token';
        localStorage.setItem('token', newToken);
        setToken(newToken);
        resolve(true);
      }, 1000);
    });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    // For development, always return true to bypass authentication
    return true; // Change this to "return !!token;" when ready for real authentication
  };

  // Context value
  const value = {
    token,
    user,
    isLoading,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
