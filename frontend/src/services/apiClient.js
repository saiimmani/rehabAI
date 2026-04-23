import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Guard against accidental MongoDB URI as API URL
if (API_BASE_URL.startsWith('mongodb')) {
  console.error(
    'CONFIGURATION ERROR: REACT_APP_API_URL is set to a MongoDB URI! ' +
    'It should be your backend HTTP URL, e.g. https://rehabai-backend.onrender.com/api'
  );
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s — Render free tier can take 30-60s on cold start
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Safety guard — never hit a MongoDB URI
    if (config.baseURL && config.baseURL.startsWith('mongodb')) {
      return Promise.reject(new Error(
        'CONFIGURATION ERROR: Your frontend is trying to connect to a MongoDB database directly! ' +
        'Please check your frontend/.env file and ensure REACT_APP_API_URL is set to your backend URL.'
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

// Global response error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redirect to login on 401 ONLY when the user is NOT already on the login/register page
    // This prevents the white-screen bug where a failed login attempt triggers a redirect loop
    if (error.response?.status === 401) {
      const currentHash = window.location.hash;
      const isAuthPage = currentHash.includes('/login') || currentHash.includes('/register');
      if (!isAuthPage) {
        localStorage.removeItem('token');
        window.location.replace('/#/login');
      }
    }

    // Enrich the error message for network failures
    if (!error.response) {
      error.message =
        'Unable to reach the server. Please check your internet connection or try again later.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
