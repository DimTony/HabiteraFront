import { useAuthStore } from "../../stores/useAuthStore";

/**
 * Logout Service
 *
 * Handles automatic logout when 401 Unauthorized is received.
 * This service clears authentication state and dispatches an event
 * to trigger navigation to the login screen.
 */

// Flag to prevent multiple simultaneous logout attempts
let isLoggingOut = false;

/**
 * Handles automatic logout on 401 Unauthorized responses
 *
 * This function:
 * 1. Clears the auth store (tokens, user data, etc.)
 * 2. Clears React Query cache
 * 3. Dispatches a custom event to trigger navigation
 *
 * @returns Promise<void>
 */
export const handleAutoLogout = async (): Promise<void> => {
  // Get current user info for debugging
  const { user, getUserRole } = useAuthStore.getState();
  const userRole = getUserRole();

  console.log("🚪 AUTO-LOGOUT DEBUG: handleAutoLogout called", {
    userRole: userRole,
    userType: user?.userType,
    userId: user?.id,
    isLoggingOut: isLoggingOut,
    windowExists: typeof window !== "undefined",
  });

  // Prevent multiple simultaneous logout attempts
  if (isLoggingOut) {
    console.warn(
      "⚠️ AUTO-LOGOUT DEBUG: Logout already in progress, skipping duplicate call",
    );
    return;
  }

  try {
    isLoggingOut = true;
    console.log(
      `🔒 AUTO-LOGOUT DEBUG: Starting auto-logout for ${userRole} user`,
    );

    // Clear auth store (this also clears tokens, user data, and React Query cache)
    const { logout } = useAuthStore.getState();
    console.log("🔄 AUTO-LOGOUT DEBUG: Calling auth store logout...");
    await logout();
    console.log("✅ AUTO-LOGOUT DEBUG: Auth store logout completed");

    // Dispatch custom event to trigger navigation in App.tsx
    if (typeof window !== "undefined") {
      console.log("📡 AUTO-LOGOUT DEBUG: Dispatching auth:force-logout event");
      window.dispatchEvent(new CustomEvent("auth:force-logout"));
      console.log("📡 AUTO-LOGOUT DEBUG: Event dispatched successfully");
    } else {
      console.warn(
        "❌ AUTO-LOGOUT DEBUG: Window object not available, cannot dispatch event",
      );
    }
  } catch (error) {
    console.error("❌ AUTO-LOGOUT DEBUG: Error during auto-logout:", error);
  } finally {
    // Reset flag after a short delay to allow event processing
    setTimeout(() => {
      console.log("🔓 AUTO-LOGOUT DEBUG: Resetting isLoggingOut flag");
      isLoggingOut = false;
    }, 1000);
  }
};
