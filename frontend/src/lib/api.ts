import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // In production (e.g., Vercel), always use the relative /api path unless
  // REACT_APP_API_URL is explicitly set to a non-local external URL.
  // This prevents a leftover REACT_APP_API_URL=http://localhost:5000/api env var
  // (which may have been set for local testing) from breaking the production
  // deployment with ERR_CONNECTION_REFUSED errors.
  if (process.env.NODE_ENV === 'production') {
    const explicitUrl = process.env.REACT_APP_API_URL;
    if (explicitUrl) {
      try {
        const { hostname } = new URL(explicitUrl);
        const localHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
        if (!localHostnames.includes(hostname)) {
          return explicitUrl;
        }
      } catch {
        // Malformed URL – fall through to the safe default below
      }
    }
    return '/api';
  }

  // In development, use explicit URL or localhost fallback
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
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
