import { useEffect, useState } from 'react';

/**
 * Return type for useOnlineStatus hook
 */
interface OnlineStatusReturn {
  /**
   * Whether the user is currently online
   */
  isOnline: boolean;

  /**
   * Whether the user was offline at some point
   * (useful for showing "reconnected" messages)
   */
  wasOffline: boolean;
}

/**
 * Custom hook to detect online/offline status
 *
 * Features:
 * - Detects initial online/offline state
 * - Listens for online/offline events
 * - Tracks if user was offline (for reconnection messages)
 * - Automatically cleans up event listeners
 *
 * Usage:
 * ```tsx
 * function App() {
 *   const { isOnline, wasOffline } = useOnlineStatus();
 *
 *   if (!isOnline) {
 *     return <OfflineErrorScreen />;
 *   }
 *
 *   if (wasOffline) {
 *     toast.success('You are back online!');
 *   }
 *
 *   return <NormalApp />;
 * }
 * ```
 *
 * @returns Online status and offline history
 */
export function useOnlineStatus(): OnlineStatusReturn {
  // Initialize with current online status
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Track if user was offline at some point
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    // Handler for when connection is restored
    const handleOnline = () => {
//       console.log('🌐 ONLINE: Connection restored');
      setIsOnline(true);
    };

    // Handler for when connection is lost
    const handleOffline = () => {
//       console.log('📡 OFFLINE: Connection lost');
      setIsOnline(false);
      setWasOffline(true); // Mark that user experienced offline state
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    wasOffline,
  };
}
