import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useSafeArea } from "../hooks/useSafeAreaView";

interface ErrorPageProps {
  /**
   * The error message to display
   */
  error?: Error;

  /**
   * Optional callback when user clicks reload button
   */
  onReload?: () => void;
}

/**
 * Full-screen error page displayed when an uncaught error occurs
 *
 * Features:
 * - Animated error icon with pulsing effects
 * - Clear error message
 * - Reload button to restart the app
 * - Safe area handling for mobile devices
 * - Matches app design system (similar to OfflineErrorScreen and TransactionErrorScreen)
 *
 * Usage:
 * ```tsx
 * <ErrorPage error={error} onReload={() => window.location.reload()} />
 * ```
 */
export function ErrorPage({ error, onReload }: ErrorPageProps) {
  const [showContent, setShowContent] = useState(false);
  const { safeArea } = useSafeArea();

  useEffect(() => {
    // Animate content appearance
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  const errorMessage = error?.message || "An unexpected error occurred";
  const errorStack = error?.stack;

  return (
    <div className="bg-background min-h-screen">
      {/* Content */}
      <div className="px-6 py-8 space-y-6 flex flex-col min-h-screen">
        <div
          className={`space-y-6 transition-all duration-700 flex-1 flex flex-col justify-center ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Error Animation */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 relative"
            >
              <AlertCircle className="w-12 h-12 text-red-600" />

              {/* Error animation rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-200"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-red-300"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              />
            </motion.div>

            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Something Went Wrong
            </h1>
            <p className="text-muted-foreground text-sm">
              We encountered an unexpected error
            </p>
          </div>

          {/* Error Details Card */}
          <Card className="p-6 border-0 shadow-sm bg-card rounded-2xl">
            <div className="space-y-6">
              {/* Access Logo */}
              <div className="flex justify-center mb-4">
                <img
                  src={`/assets/3ebf5c44175bf36c1eceb7236d272904dfc164a1.png`}
                  alt="Access Bank"
                  className="h-8 object-contain"
                />
              </div>

              {/* Error Message */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Error Details
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>

              {/* Error Stack (only in development) */}
              {/* {process.env.NODE_ENV === "development" && errorStack && (
                <details className="mt-4">
                  <summary className="text-xs text-muted-foreground cursor-pointer mb-2">
                    Technical Details (Development Only)
                  </summary>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto max-h-40 text-gray-700 dark:text-gray-300">
                    {errorStack}
                  </pre>
                </details>
              )} */}
            </div>
          </Card>

          {/* Info Text */}
          <div className="text-center px-4">
            <p className="text-sm text-muted-foreground">
              Please try reloading the app. If the problem persists, contact
              support.
            </p>
          </div>
        </div>

        {/* Reload Button - Fixed at bottom */}
        <div className="pt-4" style={{ paddingBottom: `${safeArea.bottom}px` }}>
          <Button
            onClick={handleReload}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors"
          >
            <span className="flex items-center justify-center">
              <RefreshCw className="w-5 h-5 mr-2" />
              Reload App
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
