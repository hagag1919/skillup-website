import apiClient from './client.js';
import type { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  User,
  ApiResponse
} from '../types/index.js';
import type { AxiosError } from 'axios';

export const authApi = {
  // Register user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      if (response.data.success) {
        const backendData = response.data.data;
        
        // Transform backend response to match our AuthResponse interface
        const authResponse: AuthResponse = {
          success: true,
          data: {
            token: backendData.token,
            userId: backendData.id,
            user: {
              id: backendData.id,
              name: backendData.name,
              email: backendData.email,
              role: backendData.role
            }
          }
        };
        
        // Store token and user data in localStorage
        localStorage.setItem('token', backendData.token);
        localStorage.setItem('user', JSON.stringify(authResponse.data.user));
        
        return authResponse;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error('Registration error:', error);
      
      if (axiosError.response?.data) {
        throw new Error(axiosError.response.data.message || 'Registration failed');
      }
      
      // Check for CORS or network errors
      if (axiosError.code === 'ERR_NETWORK' || 
          axiosError.message?.includes('Network Error') ||
          axiosError.message?.includes('CORS')) {
        throw new Error('Unable to connect to server. This may be due to CORS configuration or network issues.');
      }
      
      throw new Error('Network error');
    }
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      if (response.data.success) {
        const backendData = response.data.data;
        
        // Transform backend response to match our AuthResponse interface
        const authResponse: AuthResponse = {
          success: true,
          data: {
            token: backendData.token,
            userId: backendData.id,
            user: {
              id: backendData.id,
              name: backendData.name,
              email: backendData.email,
              role: backendData.role
            }
          }
        };
        
        // Store token and user data in localStorage
        localStorage.setItem('token', backendData.token);
        localStorage.setItem('user', JSON.stringify(authResponse.data.user));
        
        return authResponse;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error('Login error:', error);
      
      if (axiosError.response?.data) {
        throw new Error(axiosError.response.data.message || 'Login failed');
      }
      
      // Check for CORS or network errors
      if (axiosError.code === 'ERR_NETWORK' || 
          axiosError.message?.includes('Network Error') ||
          axiosError.message?.includes('CORS')) {
        throw new Error('Unable to connect to server. This may be due to CORS configuration or network issues.');
      }
      
      throw new Error('Network error');
    }
  },

  // Validate token
  validateToken: async (): Promise<{ valid: boolean; user?: User }> => {
    try {
      const response = await apiClient.get<ApiResponse<{ valid: boolean; user?: User }>>('/api/auth/validate');
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Token validation failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      if (axiosError.response?.data) {
        throw new Error(axiosError.response.data.message || 'Token validation failed');
      }
      throw new Error('Network error');
    }
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<{
        token: string;
        id: number;
        name: string;
        email: string;
        role: string;
      }>>('/api/auth/refresh');
      
      if (response.data.success) {
        const backendData = response.data.data;
        
        const authResponse: AuthResponse = {
          success: true,
          data: {
            token: backendData.token,
            userId: backendData.id,
            user: {
              id: backendData.id,
              name: backendData.name,
              email: backendData.email,
              role: backendData.role as 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
            }
          }
        };
        
        // Update stored token and user
        localStorage.setItem('token', backendData.token);
        localStorage.setItem('user', JSON.stringify(authResponse.data.user));
        
        return authResponse;
      } else {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error('Token refresh error:', error);
      
      if (axiosError.response?.data) {
        throw new Error(axiosError.response.data.message || 'Token refresh failed');
      }
      
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      throw new Error('Session expired. Please log in again.');
    }
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Get current token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }
};
