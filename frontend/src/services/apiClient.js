import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use(
  (config) => {
    // 🛑 Prevent "Unsupported protocol mongodb" from crashing the browser network stack
    if (config.baseURL && config.baseURL.startsWith('mongodb')) {
      return Promise.reject(new Error(
        'CONFIGURATION ERROR: Your frontend is trying to connect to a MongoDB database directly! ' +
        'Please check your frontend/.env file and ensure REACT_APP_API_URL is set to http://localhost:5000/api ' +
        '(You must restart your React server for .env changes to take effect)'
      ));
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
