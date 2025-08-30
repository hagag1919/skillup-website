import { useState, useEffect } from 'react';

// Network status hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionError(null);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionError('You are currently offline. Please check your internet connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionError };
};

// API connectivity checker
export const useApiConnectivity = (baseUrl: string) => {
  const [isApiReachable, setIsApiReachable] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkApiConnectivity = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);
      setIsApiReachable(response.ok);
      setLastChecked(new Date());
    } catch (error) {
      console.error('API connectivity check failed:', error);
      setIsApiReachable(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check connectivity on mount
    checkApiConnectivity();

    // Check connectivity every 30 seconds
    const interval = setInterval(checkApiConnectivity, 30000);

    return () => clearInterval(interval);
  }, [baseUrl]);

  return { isApiReachable, lastChecked, checkApiConnectivity };
};
