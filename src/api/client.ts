import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { ApiResponse } from '../types/index.js';

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://skillup-zvp9.onrender.com',
  TIMEOUT: 30000, // Increased timeout for CORS issues
  HEADERS: {
    'Content-Type': 'application/json',
  },
  // Add retry configuration for network issues
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle CORS errors specifically
    if (!error.response && error.code === 'ERR_NETWORK') {
      // This is likely a CORS or network error
      console.error('Network/CORS error detected:', error.message);
      const corsError = new Error('Unable to connect to server. This may be due to CORS configuration or network issues.');
      corsError.name = 'CORSError';
      return Promise.reject(corsError);
    }
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Forbidden - show access denied message
      console.error('Access denied');
    }
    
    if (error.response && error.response.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Generic API response handler
export const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message || 'API request failed');
  }
};

// Generic API error handler
export const handleApiError = (error: AxiosError | Error): never => {
  // Handle CORS/Network errors
  if (error.name === 'CORSError' || (!('response' in error) && error.message.includes('CORS'))) {
    throw new Error('Unable to connect to server. Please check your internet connection or try again later.');
  }
  
  if ('response' in error && error.response?.data) {
    const apiError = error.response.data as ApiResponse;
    throw new Error(apiError.message || 'API request failed');
  } else if ('request' in error && error.request) {
    throw new Error('Network error - please check your connection and try again');
  } else {
    throw new Error(error.message || 'Request failed');
  }
};

export default apiClient;

// Helper function to retry requests on network errors
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = API_CONFIG.MAX_RETRIES,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await requestFn();
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (attempt === maxRetries + 1) {
        // Last attempt failed, throw the error
        throw error;
      }
      
      // Only retry on network errors, not authentication or validation errors
      if ((error as Error).name === 'CORSError' || 
          axiosError.code === 'ERR_NETWORK' || 
          (axiosError.response && axiosError.response.status >= 500)) {
        console.log(`Request failed (attempt ${attempt}/${maxRetries + 1}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      } else {
        // Don't retry for other types of errors
        throw error;
      }
    }
  }
  
  throw new Error('Max retries reached');
};
