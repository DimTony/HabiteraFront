import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

interface OfflineErrorScreenProps {
  /**
   * Whether the offline screen should be shown
   */
  isOffline: boolean;

  /**
   * Optional callback when user clicks retry button
   * (Usually just to provide feedback, as reconnection is automatic)
   */
  onRetry?: () => void;
}

/**
 * Full-screen overlay that appears when the user loses internet connection
 *
 * Features:
 * - Animated entrance/exit
 * - Cannot be dismissed manually (only disappears when connection restored)
 * - Shows WiFi off icon and clear message
 * - Retry button for user feedback
 * - Auto-dismisses when connection is restored
 *
 * Usage:
 * ```tsx
 * const { isOnline } = useOnlineStatus();
 *
 * return (
 *   <>
 *     <YourApp />
 *     <OfflineErrorScreen isOffline={!isOnline} />
 *   </>
 * );
 * ```
 */
export function OfflineErrorScreen({
  isOffline,
  onRetry
}: OfflineErrorScreenProps) {
  const handleRetry = () => {
    // Check if connection is back
    if (navigator.onLine) {
      // Connection is back, component will auto-hide
//       console.log('✅ Connection restored');
    } else {
      // Still offline, show feedback
//       console.log('❌ Still offline');
    }

    // Call optional callback
    onRetry?.();
  };

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center px-6"
        >
          {/* Animated WiFi Off Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1
            }}
            className="mb-8"
          >
            <div className="relative">
              {/* Pulsing background circle */}
              <motion.div
                className="absolute inset-0 w-32 h-32 bg-red-500/20 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Icon container */}
              <div className="relative w-32 h-32 bg-red-500/10 rounded-full flex items-center justify-center border-4 border-red-500/30">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
                  <WifiOff className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-3 mb-12"
          >
            <h1 className="text-2xl font-bold text-white">No Internet Connection</h1>
            <p className="text-base text-gray-300 max-w-sm">
              Please check your connection and try again. The app will automatically reconnect when internet is available.
            </p>
          </motion.div>

          {/* Connection Status Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-md space-y-4 mb-8"
          >
            {/* Status Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <div>
                    <p className="text-sm text-gray-400">Connection Status</p>
                    <p className="font-semibold text-white">Offline</p>
                  </div>
                </div>
                <WifiOff className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </motion.div>

          {/* Retry Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full max-w-md"
          >
            <Button
              onClick={handleRetry}
              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-6 rounded-xl transition-all duration-300"
            >
              <span className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span className="font-semibold">Check Connection</span>
              </span>
            </Button>
          </motion.div>

          {/* Auto-reconnect Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-400">
              Waiting for connection...
            </p>
          </motion.div>

          {/* Animated dots indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 flex space-x-2"
          >
            <motion.div
              className="w-2 h-2 bg-gray-500 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-gray-500 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-gray-500 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
