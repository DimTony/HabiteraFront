import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * Configuration for inactivity timer
 */
interface InactivityTimerConfig {
  /**
   * Time in milliseconds before showing warning modal
   * Default: 2 minutes (120000ms)
   */
  warningTimeout?: number;

  /**
   * Time in milliseconds before auto logout
   * Default: 3 minutes (180000ms)
   */
  logoutTimeout?: number;

  /**
   * Enable/disable the timer
   * Default: true
   */
  enabled?: boolean;
}

/**
 * Return type for useInactivityTimer hook
 */
interface InactivityTimerReturn {
  /**
   * Whether the warning modal should be shown
   */
  showWarning: boolean;

  /**
   * Remaining time in seconds before auto logout
   */
  remainingSeconds: number;

  /**
   * Reset the timer (user activity detected or user clicked "Stay logged in")
   */
  resetTimer: () => void;

  /**
   * Manually trigger logout
   */
  handleLogout: () => void;
}

/**
 * Custom hook to handle auto logout due to user inactivity
 *
 * Features:
 * - Tracks user activity (clicks, touches, keyboard, mouse movement)
 * - Shows warning modal 1 minute before auto logout
 * - Automatically logs out user after configured timeout
 * - Allows user to extend session from warning modal
 *
 * @param config - Configuration options for the timer
 * @returns Timer state and control functions
 *
 * @example
 * ```tsx
 * function App() {
 *   const { showWarning, remainingSeconds, resetTimer, handleLogout } = useInactivityTimer({
 *     warningTimeout: 120000, // 2 minutes
 *     logoutTimeout: 180000,  // 3 minutes
 *   });
 *
 *   return (
 *     <>
 *       {showWarning && (
 *         <AutoLogoutWarning
 *           remainingSeconds={remainingSeconds}
 *           onStayLoggedIn={resetTimer}
 *           onLogout={handleLogout}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function useInactivityTimer(config: InactivityTimerConfig = {}): InactivityTimerReturn {
  const {
    warningTimeout = 2 * 60 * 1000, // 2 minutes default
    logoutTimeout = 3 * 60 * 1000,   // 3 minutes default
    enabled = true,
  } = config;

  const { logout, isAuthenticated, updateLastActivity } = useAuthStore();

  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  /**
   * Clear all active timers
   */
  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  /**
   * Handle logout and cleanup
   */
  const handleLogout = useCallback(() => {
//     console.log('🔒 AUTO LOGOUT: Logging out due to inactivity');
    clearTimers();
    setShowWarning(false);
    logout();
  }, [logout, clearTimers]);

  /**
   * Start countdown when warning is shown
   */
  const startCountdown = useCallback(() => {
    // Calculate time until logout
    const timeUntilLogout = logoutTimeout - warningTimeout;
    setRemainingSeconds(Math.floor(timeUntilLogout / 1000));

    // Update countdown every second
    countdownIntervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [logoutTimeout, warningTimeout]);

  /**
   * Reset all timers - called on user activity or "Stay logged in" button
   */
  const resetTimer = useCallback(() => {
    if (!enabled || !isAuthenticated) return;

    // Update last activity timestamp (both locally and in auth store)
    lastActivityRef.current = Date.now();
    updateLastActivity();

    // Clear existing timers
    clearTimers();
    setShowWarning(false);

//     console.log('⏰ INACTIVITY TIMER: Reset due to user activity');

    // Set warning timer
    warningTimerRef.current = setTimeout(() => {
//       console.log('⚠️ INACTIVITY WARNING: Showing warning modal');
      setShowWarning(true);
      startCountdown();
    }, warningTimeout);

    // Set logout timer
    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, logoutTimeout);
  }, [enabled, isAuthenticated, clearTimers, warningTimeout, logoutTimeout, startCountdown, handleLogout, updateLastActivity]);

  /**
   * Setup activity listeners on mount
   */
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      clearTimers();
      return;
    }

    // Events to track user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Throttle activity detection to avoid excessive resets
    let throttleTimeout: NodeJS.Timeout | null = null;
    const handleActivity = () => {
      // Only reset if at least 1 second has passed since last activity
      const now = Date.now();
      if (now - lastActivityRef.current < 1000) return;

      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        resetTimer();
        throttleTimeout = null;
      }, 1000);
    };

    // Add activity listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize timer
    resetTimer();

    // Cleanup on unmount
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimers();
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [enabled, isAuthenticated, resetTimer, clearTimers]);

  /**
   * Cleanup on logout
   */
  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      setShowWarning(false);
    }
  }, [isAuthenticated, clearTimers]);

  return {
    showWarning,
    remainingSeconds,
    resetTimer,
    handleLogout,
  };
}