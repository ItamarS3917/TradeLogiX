import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden errors
    if (response && response.status === 403) {
      console.error('Access forbidden');
    }
    
    // Handle 404 Not Found errors
    if (response && response.status === 404) {
      console.error('Resource not found');
    }
    
    // Handle 500 Internal Server Error
    if (response && response.status >= 500) {
      console.error('Server error');
    }
    
    // Handle network errors (no response from server)
    if (!response) {
      console.error('Network error - no response from server');
    }
    
    return Promise.reject(error);
  }
);

export default api;
