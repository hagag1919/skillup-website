import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { validateToken, refreshToken } from '../store/slices/authSlice';
import { tokenUtils, sessionUtils } from '../utils/auth';

// Configuration from environment variables
const TOKEN_REFRESH_INTERVAL = Number(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 2 * 60 * 1000; // 2 minutes default
const TOKEN_WARNING_TIME = Number(import.meta.env.VITE_TOKEN_WARNING_TIME) || 5 * 60 * 1000; // 5 minutes default

// Hook for automatic session management
export const useSessionManager = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Validate token on app load
  const validateSession = useCallback(async () => {
    if (!sessionUtils.isValidSession()) {
      sessionUtils.clearSession();
      return;
    }

    try {
      await dispatch(validateToken()).unwrap();
    } catch (error) {
      console.error('Session validation failed:', error);
      sessionUtils.clearSession();
    }
  }, [dispatch]);

  // Refresh token before expiration
  const refreshTokenIfNeeded = useCallback(async () => {
    const currentToken = tokenUtils.getToken();
    if (!currentToken || !isAuthenticated) return;

    try {
      const payload = tokenUtils.getUserFromToken(currentToken);
      if (payload && typeof payload.exp === 'number') {
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;
        
        // Refresh token if it expires in less than configured time
        if (timeUntilExpiry < TOKEN_WARNING_TIME && timeUntilExpiry > 0) {
          console.log('Refreshing token before expiration...');
          await dispatch(refreshToken()).unwrap();
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      sessionUtils.clearSession();
    }
  }, [dispatch, isAuthenticated]);

  // Set up periodic token validation and refresh
  useEffect(() => {
    if (isAuthenticated) {
      // Validate session on mount
      validateSession();

      // Set up interval to check token expiration
      const interval = setInterval(() => {
        refreshTokenIfNeeded();
      }, TOKEN_REFRESH_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, validateSession, refreshTokenIfNeeded]);

  // Set up visibility change listener to refresh token when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // Tab became visible, check if token needs refresh
        refreshTokenIfNeeded();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, refreshTokenIfNeeded]);

  return {
    validateSession,
    refreshTokenIfNeeded,
  };
};

// Hook for token expiration warning
export const useTokenExpirationWarning = () => {
  const { token } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token) return;

    try {
      const payload = tokenUtils.getUserFromToken(token);
      if (payload && typeof payload.exp === 'number') {
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;
        
        // Show warning if token expires in less than 2 minutes
        if (timeUntilExpiry < 2 * 60 * 1000 && timeUntilExpiry > 0) {
          const timeout = setTimeout(() => {
            // Try to refresh token or show warning
            dispatch(refreshToken()).catch(() => {
              console.warn('Session will expire soon. Please save your work.');
            });
          }, Math.max(0, timeUntilExpiry - 60 * 1000)); // 1 minute before expiry

          return () => clearTimeout(timeout);
        }
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
    }
  }, [token, dispatch]);
};
