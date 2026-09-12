import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnectivity = async (): Promise<boolean> => {
    if (typeof navigator === 'undefined') return true;
    
    // Check navigator first
    if (!navigator.onLine) return false;

    // Try a small fetch to verify real internet access
    try {
      // Use a reliable endpoint like Google's favicon or a lightweight API
      const response = await fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
        cache: 'no-store'
      });
      return !!response;
    } catch (error) {
      return false;
    }
  };

  const refreshStatus = async () => {
    const status = await checkConnectivity();
    setIsOnline(status);
    return status;
  };

  return { isOnline, checkConnectivity, refreshStatus };
}
