import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Error handling interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // User endpoints
  users: {
    create: (userData) => api.post('/api/users', userData),
    getAll: (params) => api.get('/api/users', { params }),
    getById: (id) => api.get(`/api/users/${id}`),
    update: (id, userData) => api.put(`/api/users/${id}`, userData),
    delete: (id) => api.delete(`/api/users/${id}`),
  },
  
  // Authentication endpoints
  auth: {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    logout: () => api.post('/api/auth/logout'),
    refreshToken: () => api.post('/api/auth/refresh-token'),
  },
  
  // Trade endpoints
  trades: {
    create: (tradeData) => api.post('/api/trades', tradeData),
    getAll: (params) => api.get('/api/trades', { params }),
    getById: (id) => api.get(`/api/trades/${id}`),
    update: (id, tradeData) => api.put(`/api/trades/${id}`, tradeData),
    delete: (id) => api.delete(`/api/trades/${id}`),
    getStatistics: (userId, params) => 
      api.get(`/api/trades/statistics/${userId}`, { params }),
  },
  
  // Daily Plan endpoints
  plans: {
    create: (planData) => api.post('/api/plans', planData),
    getAll: (params) => api.get('/api/plans', { params }),
    getById: (id) => api.get(`/api/plans/${id}`),
    getByDate: (date) => api.get(`/api/plans/date/${date}`),
    update: (id, planData) => api.put(`/api/plans/${id}`, planData),
    delete: (id) => api.delete(`/api/plans/${id}`),
  },
  
  // Journal endpoints
  journals: {
    create: (journalData) => api.post('/api/journals', journalData),
    getAll: (params) => api.get('/api/journals', { params }),
    getById: (id) => api.get(`/api/journals/${id}`),
    update: (id, journalData) => api.put(`/api/journals/${id}`, journalData),
    delete: (id) => api.delete(`/api/journals/${id}`),
  },
  
  // Statistics endpoints
  statistics: {
    getAll: (params) => api.get('/api/statistics', { params }),
    getById: (id) => api.get(`/api/statistics/${id}`),
    getByPeriod: (userId, period, params) => 
      api.get(`/api/statistics/${userId}/${period}`, { params }),
  },
  
  // Alerts endpoints
  alerts: {
    create: (alertData) => api.post('/api/alerts', alertData),
    getAll: (params) => api.get('/api/alerts', { params }),
    getById: (id) => api.get(`/api/alerts/${id}`),
    update: (id, alertData) => api.put(`/api/alerts/${id}`, alertData),
    delete: (id) => api.delete(`/api/alerts/${id}`),
    markAsRead: (id) => api.put(`/api/alerts/${id}/read`),
  },
  
  // TradeSage AI endpoints
  tradeSage: {
    getInsights: (userId, params) => 
      api.get(`/api/tradesage/insights/${userId}`, { params }),
    askQuestion: (question) => api.post('/api/tradesage/ask', { question }),
  },
  
  // Upload endpoints
  uploads: {
    uploadScreenshot: (formData) => 
      api.post('/api/uploads/screenshot', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
  },
};

export default api;
