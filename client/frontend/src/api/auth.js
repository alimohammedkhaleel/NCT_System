import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor
authApi.interceptors.request.use(
  (config) => {
    // Add token to headers if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CSRF token if needed
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Format error message
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
      originalError: error
    });
  }
);

// Validation functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateLoginForm = (username, password) => {
  const errors = {};

  if (!username || username.trim() === '') {
    errors.username = 'Email or username is required';
  }

  if (!password || password === '') {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Rate limiting
let loginAttempts = 0;
let lastLoginAttemptTime = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes

export const checkRateLimit = () => {
  const now = Date.now();
  
  // Reset if lockout period has passed
  if (now - lastLoginAttemptTime > LOCKOUT_TIME) {
    loginAttempts = 0;
  }

  if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_TIME - (now - lastLoginAttemptTime)) / 1000);
    throw new Error(`Too many login attempts. Please try again in ${remainingTime} seconds.`);
  }
};

export const incrementLoginAttempts = () => {
  loginAttempts++;
  lastLoginAttemptTime = Date.now();
};

export const resetLoginAttempts = () => {
  loginAttempts = 0;
  lastLoginAttemptTime = 0;
};

// Auth API calls
export const login = async (usernameOrEmail, password) => {
  try {
    // Validate form
    const validation = validateLoginForm(usernameOrEmail, password);
    if (!validation.isValid) {
      throw {
        message: Object.values(validation.errors).join(', '),
        errors: validation.errors
      };
    }

    // Check rate limit
    checkRateLimit();

    const response = await authApi.post('/auth/login', {
      username: usernameOrEmail,
      password: password
    });

    // Success - reset rate limit
    resetLoginAttempts();

    // Store token and user data
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Login successful'
    };
  } catch (error) {
    incrementLoginAttempts();

    return {
      success: false,
      message: error.message || 'Login failed. Please try again.',
      errors: error.errors || {}
    };
  }
};

export const logout = async () => {
  try {
    // Clear client-side data immediately
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Try to notify server (optional)
    try {
      await authApi.post('/auth/logout');
    } catch (err) {
      console.error('Logout notification failed:', err);
    }

    return { success: true };
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  }
};

export const checkAuth = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return { success: false, isAuthenticated: false };
    }

    const response = await authApi.get('/auth/profile');
    
    return {
      success: true,
      isAuthenticated: true,
      user: response.data.data
    };
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return {
      success: false,
      isAuthenticated: false,
      error: error.message
    };
  }
};

export const register = async (formData) => {
  try {
    const response = await authApi.post('/auth/register', formData);

    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Registration successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Registration failed',
      errors: error.errors || {}
    };
  }
};

export default authApi;
