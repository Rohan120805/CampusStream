import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // If explicitly set in env, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In production (on Vercel), use relative path
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // In development, use localhost
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth0_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
      console.log('🔑 Token present:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      console.error('🚫 Unauthorized - Token invalid or expired');
      console.error('   Server message:', error.response?.data?.message);
      localStorage.removeItem('auth0_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
