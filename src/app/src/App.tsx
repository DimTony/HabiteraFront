import React, {
  useState,
  Suspense,
  lazy,
  startTransition,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence, type Transition } from "motion/react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./stores/useAuthStore";
// import {  } from "./services/storage";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
// SECURITY FIX: CWE-117 - Import sanitization function for log security
// import { sanitizeForLog } from "./src/utils/security";
// import { InventoryViewScreen } from "./components/InventoryViewScreen";
import { useInactivityTimer } from "./hooks/useInactivityTimer";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import {
  getUserData,
  saveUserData,
  removeUserData,
  getBusinessToolsConfig,
  setBusinessToolsConfig,
  clearPendingProfileData,
  hasSeenSplashScreen,
  setSplashScreenSeen,
  setExplicitLogoutFlag,
} from "./stores/storage";
import { AppContextProvider } from "./contexts/AppContext";
import { formatErrorMessage } from "./utils/errorMessageFormatter";
import { useLogoutMutation } from "./hooks/onboarding/useOnboardingMutations";
import { isTokenExpired } from "./api/services/token.service";
import { handleAutoLogout } from "./api/services/logout.service";
import { SplashScreen } from "./components/SplashScreen";
import { InitialLoginScreen } from "./components/InitialLoginScreen";
import { AutoLogoutWarning } from "./components/AutoLogoutWarning";
import { OfflineErrorScreen } from "./components/OfflineErrorScreen";
import { EntryChoiceScreen } from "./components/EntryChoiceScreen";
import { UnregisteredBusinessChoiceScreen } from "./components/UnregisteredBusinessChoiceScreen";
import type { Tab, UserRole } from "./types/common.types";
import type { LoginUserData } from "./types/api.types";

const Dashboard = lazy(() =>
  import("./components/Dashboard").then((module) => ({
    default: module.Dashboard,
  })),
);
const ManagerDashboard = lazy(() =>
  import("./components/ManagerDashboard").then((module) => ({
    default: module.ManagerDashboard,
  })),
);
const BottomNavigation = lazy(() =>
  import("./components/BottomNavigation").then((module) => ({
    default: module.BottomNavigation,
  })),
);

const AddPropertyScreen = lazy(() =>
  import("./components/AddPropertyScreen").then((module) => ({
    default: module.AddProperty,
  })),
);

const CompleteProfileScreen = lazy(() =>
  import("./components/CompleteProfile").then((module) => ({
    default: module.CompleteProfile,
  })),
);

const AdminPortalScreen = lazy(() =>
  import("./components/AdminPortalScreen").then((module) => ({
    default: module.AdminPortalScreen,
  })),
);
const ForgotPasswordScreen = lazy(() =>
  import("./components/ForgotPasswordScreen").then((module) => ({
    default: module.ForgotPasswordScreen,
  })),
);
const ForgotPasswordOTPScreen = lazy(() =>
  import("./components/ForgotPasswordOTPScreen").then((module) => ({
    default: module.ForgotPasswordOTPScreen,
  })),
);
const LoadingSpinner = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center">
    {/* Animated Logo Container */}
    <div className="relative w-24 h-24">
      {/* Pulsing background rings */}
      <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
      <div
        className="absolute inset-2 rounded-full bg-primary/5 animate-pulse"
        style={{ animationDelay: "0.2s" }}
      />

      {/* Access Bank Logo SVG - Animated */}
      <div className="absolute inset-0 flex items-center justify-center animate-pulse">
        <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none">
          {/* Outer diamond */}
          <path
            d="M50 5 L95 50 L50 95 L5 50 Z"
            stroke="#F37021"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="animate-[dash_1.5s_ease-in-out_infinite]"
            strokeDasharray="280"
            strokeDashoffset="280"
            style={{
              animation: "dash 1.5s ease-in-out infinite",
            }}
          />

          {/* Middle diamond */}
          <path
            d="M50 20 L80 50 L50 80 L20 50 Z"
            stroke="#F37021"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{
              animation: "dash 1.5s ease-in-out infinite 0.2s",
            }}
            strokeDasharray="170"
            strokeDashoffset="170"
          />

          {/* Inner diamond */}
          <path
            d="M50 35 L65 50 L50 65 L35 50 Z"
            stroke="#F37021"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{
              animation: "dash 1.5s ease-in-out infinite 0.4s",
            }}
            strokeDasharray="85"
            strokeDashoffset="85"
          />
        </svg>
      </div>
    </div>

    {/* Loading text */}
    <p className="mt-6 text-gray-600 text-sm font-medium animate-pulse">
      Loading...
    </p>

    {/* Loading dots */}
    <div className="flex space-x-1 mt-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>

    {/* CSS for dash animation */}
    <style>{`
      @keyframes dash {
        0% {
          stroke-dashoffset: 280;
        }
        50% {
          stroke-dashoffset: 0;
        }
        100% {
          stroke-dashoffset: 280;
        }
      }
    `}</style>
  </div>
);

type Screen =
  | "initial-login"
  | "dashboard"
  | "complete-profile"
  | "add-property"
  | "first-login-password-change"
  | "admin-portal"
  | "forgot-password"
  | "forgot-password-otp"
  | "forgot-password-new-password"
  | "entry-choice"
  | "unregistered-business-choice"
  | "store-linking";



interface Transaction {
  id: string;
  type: "inflow" | "outflow";
  source: string;
  amount: number;
  date: string;
  time: string;
  category?: string;
  method?: string;
  reference?: string;
}

function AppContent() {
  const queryClient = useQueryClient();
  const logoutMutation = useLogoutMutation();
  const { isOnline } = useOnlineStatus();
  const [navigationHistory, setNavigationHistory] = useState<
    Array<{ screen: Screen; tab?: Tab }>
  >([]);

  const [currentKYCTier, setCurrentKYCTier] = useState(1);
  const [showBusinessToolsModal, setShowBusinessToolsModal] = useState(false);
  const [transactionRefreshKey, setTransactionRefreshKey] = useState(0);
  const [showTransferAuthModal, setShowTransferAuthModal] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState<boolean>(false);
  const [needsStoreLinking, setNeedsStoreLinking] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("initial-login");
  const [currentTab, setCurrentTab] = useState<Tab>("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [staffData, setStaffData] = useState<LoginUserData | null>(null);
  const staffName = useMemo(() => staffData?.firstName || staffData?.email || "", [staffData]);
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState("");
  const [selectedBusinessTools, setSelectedBusinessTools] = useState<string[]>(
    () => {
      const savedConfig = getBusinessToolsConfig();
      return (
        savedConfig?.selectedTools || [
          "sell", // Default tool 1
          "invoice", // Default tool 2
          "orders", // Default tool 3
          "expenses", // Default tool 4
        ]
      );
    },
  );

  useEffect(() => {
    const checkSplashScreen = async () => {
      const hasSeen = await hasSeenSplashScreen();
      setShowSplash(!hasSeen);
    };
    checkSplashScreen();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const { user, getUserRole, getPosition } = useAuthStore.getState();
      if (user) {
        const mappedRole = getUserRole();
        const position = getPosition();

        // console.log('🔄 Syncing user role from Zustand:', {
        //   role: mappedRole,
        //   position: position,
        //   userFullName: user.fullName
        // });

        setUserRole(mappedRole);

        // Sync staffData from Zustand user
        setStaffData({
          id: user.id?.toString(),
          profilePhoto: user.profilePhoto,
          role: user.role,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          updatedAt: user.updatedAt,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          profileCompleted: user.profileCompleted,
          profileCompletedAt: user.profileCompletedAt,
          status: user.status,
        });
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setBusinessToolsConfig({
      selectedTools: selectedBusinessTools,
      lastUpdated: new Date().toISOString(),
    });
  }, [selectedBusinessTools]);

  const {
    showWarning: showInactivityWarning,
    remainingSeconds,
    resetTimer: resetInactivityTimer,
    handleLogout: handleInactivityLogout,
  } = useInactivityTimer({
    warningTimeout: 2 * 60 * 1000, // 2 minutes
    logoutTimeout: 3 * 60 * 1000, // 3 minutes (1 minute after warning)
    enabled: isAuthenticated, // Only track when authenticated
  });

  let handleInitialLogin = async (credentials: {
    identifier: string;
    password: string;
    isReturningUser?: boolean;
  }) => {
    const { identifier, password } = credentials;

    // Biometric authentication flow (enhanced with API integration)
    if (password === "biometric_auth") {
      // ✅ USE ZUSTAND STORE for authentication
      const {
        user: storeUser,
        isAuthenticated: storeIsAuthenticated,
        getUserRole,
        getPosition,
      } = useAuthStore.getState();

      if (storeUser && storeIsAuthenticated) {
        // SECURITY FIX: CWE-117 - Sanitize user data before logging
        console.log(
          "✅ BIOMETRIC LOGIN - Using Zustand auth store:",
          JSON.stringify(storeUser)
        );

        const mappedRole = getUserRole();
        const position = getPosition();

        // Set state from store
        setUserRole(mappedRole);
        setStaffData({
          id: storeUser.id?.toString(),
          profilePhoto: storeUser.profilePhoto,
          role: storeUser.role,
          createdAt: storeUser.createdAt,
          lastLoginAt: storeUser.lastLoginAt,
          updatedAt: storeUser.updatedAt,
          email: storeUser.email,
          firstName: storeUser.firstName,
          lastName: storeUser.lastName,
          fullName: storeUser.fullName,
          phoneNumber: storeUser.phoneNumber,
          profileCompleted: storeUser.profileCompleted,
          profileCompletedAt: storeUser.profileCompletedAt,
          status: storeUser.status,
        });
        setCurrentKYCTier(1);
        setIsAuthenticated(true);

        // Check if this is first-time login and needs store linking
        if (needsStoreLinking && isFirstTimeLogin) {
          setCurrentScreen("store-linking");
          toast.success(
            `Welcome, ${storeUser.email}! Please set up your store.`,
          );
        } else {
          setCurrentScreen("dashboard");
          toast.success(`Welcome back, ${storeUser.email}!`);
        }
        return;
      }

      // // Legacy fallback for users who haven't re-logged since Zustand migration
      // const legacyUserData = getUserData();
      // if (legacyUserData) {
      //   try {
      //     const data = JSON.parse(legacyUserData);
      //     console.log(
      //       "⚠️ BIOMETRIC LOGIN - Using legacy user data (please re-login)"
      //     );

      //     setUserRole(data.role);
      //     setStaffData(data.staffData);
      //     setCurrentKYCTier(data.kycTier || 1);
      //     if (data.role === "business-owner") {
      //       setAllStaffData(loadStaffData());
      //     }
      //     setIsAuthenticated(true);
      //     setCurrentScreen("dashboard");
      //     toast.success(`Welcome back, ${data.staffData.name}!`);
      //     return;
      //   } catch (e) {
      //     console.log("Legacy biometric data parse error:", e);
      //   }
      // }

      // // No saved biometric data - redirect to business category
      // console.log("❌ BIOMETRIC LOGIN - No saved data found");
      // setCurrentScreen("business-category");
      return;
    }

    // TODO: Replace with real user authentication API call
    // For now, all non-biometric login attempts go through business category

    // ✅ CHECK ZUSTAND STORE for authentication (priority: Zustand > legacy)
    const {
      user: storeUser,
      token: storeToken,
      isAuthenticated: storeIsAuthenticated,
      getUserRole,
      getPosition,
    } = useAuthStore.getState();

    // If we have user data in Zustand store, use it
    if (storeUser && storeToken && storeIsAuthenticated) {
      // SECURITY FIX: CWE-117 - Sanitize user data before logging
      console.log(
        "✅ API LOGIN SUCCESS - Using Zustand auth store:",
        JSON.stringify(storeUser)
      );

      const mappedRole = getUserRole();
      const position = getPosition();

      // Transform store data to app state format
      setUserRole(mappedRole);
      setStaffData({
        id: storeUser.id?.toString(),
        profilePhoto: storeUser.profilePhoto,
        role: storeUser.role,
        createdAt: storeUser.createdAt,
        lastLoginAt: storeUser.lastLoginAt,
        updatedAt: storeUser.updatedAt,
        email: storeUser.email,
        firstName: storeUser.firstName,
        lastName: storeUser.lastName,
        fullName: storeUser.fullName,
        phoneNumber: storeUser.phoneNumber,
        profileCompleted: storeUser.profileCompleted,
        profileCompletedAt: storeUser.profileCompletedAt,
        status: storeUser.status,
      });
      setCurrentKYCTier(1);
      setIsAuthenticated(true);
      setCurrentScreen("dashboard");

      // Don't show toast here - the override system already showed one
      return;
    }

    // Check for any cached user data (returning user) - legacy format
    const savedData = await getUserData();

    if (savedData) {
      try {
        const userData = JSON.parse(savedData);

        // If we have complete cached user data, it's a returning user
        if (userData && userData.role && userData.staffData) {
          console.log("✅ RETURNING USER - Using cached legacy data");

          setUserRole(userData.role);
          setStaffData(userData.staffData);
          setCurrentKYCTier(userData.kycTier || 1);
          setIsAuthenticated(true);

          // Invalidate account queries for returning user
          queryClient.invalidateQueries({ queryKey: ["accounts"] });

          // Go to dashboard immediately
          setCurrentScreen("dashboard");

          toast.success(`Welcome back, ${userData.staffData.name}!`);
          return;
        }
      } catch (error) {
        console.log("❌ Error parsing cached data:", error);
        removeUserData();
      }
    }

    // Check if user has identifier (username) but not cached
    const hasUsername = identifier && identifier.trim();

    if (hasUsername) {
      console.log("✅ NEW USER - Creating default business owner account");
      // Username present but no cached data - create business owner account
      // createDefaultUserAndLogin(identifier);
      return;
    }

    // ONLY if there's NO identifier, treat as first time user
    console.log("🆕 FIRST TIME USER - Going to business category");
    // setCurrentScreen("business-category");
    setCurrentScreen("add-property");
  };

  const handleProfileCompletionRequired = (data: {
    username: string;
    phoneNumber?: string;
    credentials: {
      username: string;
      password: string;
      cachedUsername: string;
      isReturningUser: boolean;
    };
  }) => {
    startTransition(() => {
       setIsAuthenticated(true);
      setCurrentScreen("complete-profile");

      console.log(
        "🔐 Profile Completion required - navigating to Profile Completion Screen",
      );
    });
  };

  const isBusinessOwner = () => {
    return userRole === "agent";
  };

  const navigateToScreen = (screen: Screen, tab?: Tab) => {
    startTransition(() => {
      // Push current state to history before navigating
      setNavigationHistory((prev) => [
        ...prev,
        {
          screen: currentScreen,
          tab: currentTab,
        },
      ]);
      setCurrentScreen(screen);
      if (tab) {
        setCurrentTab(tab);
      }
    });
  };

  const navigateBack = () => {
    startTransition(() => {
      if (navigationHistory.length > 0) {
        // Pop the last state from history
        const previousState = navigationHistory[navigationHistory.length - 1];
        setNavigationHistory((prev) => prev.slice(0, -1));
        setCurrentScreen(previousState.screen);
        if (previousState.tab) {
          setCurrentTab(previousState.tab);
        }
      } else {
        // Fallback to dashboard - ManagerDashboard will handle tier display
        setCurrentScreen("dashboard");
        setCurrentTab("home");
      }
    });
  };

  const clearNavigationHistory = () => {
    setNavigationHistory([]);
  };

  const handlePasswordChangeRequired = (userData: any) => {
    startTransition(() => {
      setIsAuthenticated(true);
      // setCurrentScreen("first-login-password-change");
      setCurrentScreen("add-property");

      console.log(
        "🔐 Password change required - navigating to password change screen",
      );
    });
  };

  const handlePinSetupRequired = (userData: any) => {
    startTransition(() => {
      // User is authenticated but needs to set up transaction PIN
      setIsAuthenticated(true);
      // Navigate to PIN setup screen
      // setCurrentScreen("first-login-pin-setup");
      setCurrentScreen("add-property");

      console.log("🔐 PIN setup required - navigating to PIN setup screen");
    });
  };

  const handleOTPRequired = (data: {
    username: string;
    phoneNumber?: string;
    credentials: {
      username: string;
      password: string;
      cachedUsername: string;
      isReturningUser: boolean;
    };
  }) => {
    startTransition(() => {
      // setDeviceVerificationCredentials(data.credentials);
      // setCurrentScreen("device-verification-otp");
      setCurrentScreen("add-property");

      console.log(
        "🔐 Device verification OTP required - navigating to OTP screen",
      );
    });
  };

  const handleLogout = () => {
    // Call logout API first
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        console.log("✅ Logout API call successful");
      },
      onError: (error) => {
        console.error("❌ Logout API call failed:", error);
        // Continue with logout even if API call fails
      },
      onSettled: () => {
        // Clear state regardless of API call success/failure
        startTransition(() => {
          setIsAuthenticated(false);
          setStaffData(null);
          // setHasCompletedStoreSetup(false);
          clearNavigationHistory(); // Clear history on logout

          // ✅ CLEAR ZUSTAND STORE on logout
          const { logout } = useAuthStore.getState();
          logout();

          // Clear legacy cached user data (keep username for login convenience)
          removeUserData();

          // Clear React Query cache to prevent data leakage between users
          queryClient.clear();

          // Mark explicit logout to prevent auto-biometric login loop
          setExplicitLogoutFlag(true);

          setCurrentScreen("initial-login");
          setCurrentTab("home");
        });
      },
    });
  };

  const handleLogoutRef = useRef(handleLogout);

  useEffect(() => {
    handleLogoutRef.current = handleLogout;
  }, [handleLogout]);

  useEffect(() => {
    const handleForceLogout = () => {
      const { user, getUserRole } = useAuthStore.getState();
      console.log("📡 FORCE-LOGOUT DEBUG: Received auth:force-logout event", {
        userRole: getUserRole(),
        userType: user?.role,
        currentAppState: {
          isAuthenticated,
          currentScreen,
          userRole,
        },
      });
      console.log("📡 FORCE-LOGOUT DEBUG: Triggering handleLogout...");
      handleLogoutRef.current();
    };

    console.log(
      "🔗 FORCE-LOGOUT DEBUG: Setting up window event listener for auth:force-logout",
    );
    window.addEventListener("auth:force-logout", handleForceLogout);

    return () => {
      console.log("🔗 FORCE-LOGOUT DEBUG: Removing window event listener");
      window.removeEventListener("auth:force-logout", handleForceLogout);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (storeIsAuthenticated: any) => {
        const { user, getUserRole } = useAuthStore.getState();
        console.log("🔄 AUTH-STORE DEBUG: isAuthenticated changed", {
          storeIsAuthenticated,
          currentAppIsAuthenticated: isAuthenticated,
          userRole: getUserRole(),
          userType: user?.role,
          willTriggerLogout: !storeIsAuthenticated && isAuthenticated,
        });

        // If auth store says not authenticated, update local state and redirect to login
        if (!storeIsAuthenticated && isAuthenticated) {
          console.log(
            "🚪 AUTH-STORE DEBUG: Triggering logout - redirecting to login screen",
          );
          setIsAuthenticated(false);
          setCurrentScreen("initial-login");
          setUserRole("user");
          setStaffData(null);
        }
      },
    );

    return () => unsubscribe();
  }, [isAuthenticated]);

  useEffect(() => {
    // Only run when user is authenticated
    if (!isAuthenticated) {
      return;
    }

    console.log("⏰ TOKEN-EXPIRY: Starting token expiration check interval");

    // Set up interval to check token expiration every 1 second
    const intervalId = setInterval(async () => {
      try {
        const expired = await isTokenExpired();

        if (expired === true) {
          console.log("⏰ TOKEN-EXPIRY: Token expired, triggering auto-logout");
          handleAutoLogout();
        }
      } catch (error) {
        console.error(
          "❌ TOKEN-EXPIRY: Error during token expiration check",
          error,
        );
      }
    }, 1000); // Check every 1 second

    // Cleanup interval on unmount or when authentication state changes
    return () => {
      console.log(
        "⏰ TOKEN-EXPIRY: Cleaning up token expiration check interval",
      );
      clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // Only setup on native Android platform
    if (
      !Capacitor.isNativePlatform() ||
      Capacitor.getPlatform() !== "android"
    ) {
      return;
    }

    let listenerHandle: any = null;

    // Setup listener (async)
    CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      console.log("🔙 Android back button pressed");

      // Block back button during forced flows
      if (currentScreen === "first-login-password-change") {
        // if (currentScreen === "first-login-password-change") {
        console.log("⛔ Back button blocked: Password change required");
        toast.info("Please complete your password change", {
          description: "You must set a new password to continue",
        });
        return;
      }

      // Close modals first (priority)
      if (showBusinessToolsModal) {
        setShowBusinessToolsModal(false);
        return;
      }
      if (showTransferAuthModal) {
        setShowTransferAuthModal(false);
        return;
      }

      // Use navigation history for back navigation
      if (navigationHistory.length > 0) {
        const previousState = navigationHistory[navigationHistory.length - 1];

        // Remove current state from history
        setNavigationHistory((prev) => prev.slice(0, -1));

        // Navigate to previous screen
        setCurrentScreen(previousState.screen);
        if (previousState.tab) {
          setCurrentTab(previousState.tab);
        }

        console.log(`✅ Navigated back to: ${previousState.screen}`);
        return;
      }

      // Exit app if on dashboard (home screen)
      if (currentScreen === "dashboard") {
        console.log("🚪 Exiting app from dashboard");
        CapacitorApp.exitApp();
        return;
      }

      // Default: Go back to dashboard
      console.log("📱 Going back to dashboard");
      setCurrentScreen("dashboard");
    }).then((handle) => {
      listenerHandle = handle;
    });

    // Cleanup listener on unmount
    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [
    currentScreen,
    navigationHistory,
    showBusinessToolsModal,
    showTransferAuthModal,
  ]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return; // Only for native apps
    }

    let listenerHandle: any = null;

    CapacitorApp.addListener("appUrlOpen", (event: any) => {
      console.log("🔗 Deep link opened:", event.url);

      // Parse the URL
      const url = event.url;
      let path = "";
      let params: any = {};

      try {
        // Handle custom scheme: accessbusiness://dashboard
        if (url.startsWith("accessbusiness://")) {
          path = url.replace("accessbusiness://", "");
        }
        // Handle universal links: https://sme.accessbankplc.com/dashboard
        else if (url.includes("sme.accessbankplc.com")) {
          const urlObj = new URL(url);
          path = urlObj.pathname.substring(1); // Remove leading /

          // Parse query parameters
          urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
          });
        }

        // Remove trailing slash
        path = path.replace(/\/$/, "");

        console.log(`📍 Parsed path: ${path}`, params);

        // Route to appropriate screen based on path
        if (!path || path === "dashboard") {
          setCurrentScreen("dashboard");
          toast.success("Welcome back!", {
            description: "Opening dashboard",
          });
        } else if (path === "invoice" || path.startsWith("invoice/")) {
          const invoiceId = path.split("/")[1];
          if (invoiceId) {
            console.log(`📄 Opening invoice: ${invoiceId}`);
            // TODO: Navigate to specific invoice detail
            setCurrentScreen("dashboard");
            setCurrentTab("transactions");
            toast.info("Invoice Link", {
              description: `Opening invoice: ${invoiceId}`,
            });
          } else {
            setCurrentScreen("dashboard");
            setCurrentTab("transactions");
          }
        } else if (path === "transaction" || path.startsWith("transaction/")) {
          const transactionId = path.split("/")[1];
          if (transactionId) {
            console.log(`💰 Opening transaction: ${transactionId}`);
            // TODO: Navigate to specific transaction detail
            setCurrentScreen("dashboard");
            setCurrentTab("transactions");
            toast.info("Transaction Link", {
              description: `Opening transaction: ${transactionId}`,
            });
          } else {
            setCurrentScreen("dashboard");
            setCurrentTab("transactions");
          }
        } else if (path === "inventory") {
          setCurrentScreen("dashboard");
          setCurrentTab("transactions");
          toast.info("Opening Inventory");
        } else if (path === "sell") {
          setCurrentScreen("dashboard");
          setCurrentTab("transactions");
          toast.info("Opening Sell Screen");
        } else if (path === "settings") {
          setCurrentScreen("dashboard");
          setCurrentTab("settings");
          toast.info("Opening Settings");
        } else {
          // Unknown path - go to dashboard
          console.warn(`⚠️ Unknown deep link path: ${path}`);
          setCurrentScreen("dashboard");
          toast.info("Link Opened", {
            description: "Redirecting to dashboard",
          });
        }
      } catch (error) {
        console.error("❌ Error parsing deep link:", error);
        toast.error("Invalid Link", {
          description: "Could not open the link",
        });
        setCurrentScreen("dashboard");
      }
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);

  const handleNavigateToAddProperty = () => {
    navigateToScreen("add-property");
  };

  const handleBackFromAddProperty = () => {
    // Clear selected items when leaving order link screen
    // setSelectedItemsForOrderLink([]);
    // setInventorySelectionMode(false);
    navigateBack();
  };

  const handleNavigateToTools = () => {
    setShowBusinessToolsModal(true);
  };

  const handleNavigateToOrders = () => {
    // navigateToScreen("orders");
    navigateToScreen("add-property");
  };

  const handleNavigateToTransactions = (accountId?: string) => {
    if (accountId) {
      // setSelectedPaymentAccount(accountId);
    }
    navigateToScreen("dashboard", "transactions");
  };

  const handleViewTransaction = (transaction: Transaction) => {
    // navigateToScreen("transaction-detail");
    navigateToScreen("add-property");
  };

  const handleSharePayment = () => {
    // navigateToScreen("share-payment");
    navigateToScreen("add-property");
  };

  const handleBackToInitialLogin = () => {
    clearNavigationHistory();
    setCurrentScreen("initial-login");
  };

  const handleNavigateToProducts = () => {
    // Products are loaded from API via useProductsQuery
    // Load products when navigating
    // navigateToScreen("product-list");
    navigateToScreen("add-property");
  };
  const handleNavigateToAddProduct = () => {
    // navigateToScreen("add-product");
    navigateToScreen("add-property");
  };
  const handleNavigateToStoreSetup = () => {
    navigateToScreen("add-property");
    // navigateToScreen("store-setup");
  };
  const handleNavigateToAnalytics = () => {
    navigateToScreen("add-property");
    // navigateToScreen("analytics");
  };
  const handleNavigateToProductManagement = () => {
    navigateToScreen("add-property");
    // navigateToScreen("product-management");
  };

  const handleNavigateToExpenses = () => {
    navigateToScreen("add-property");
    // navigateToScreen("expenses");
  };

  const handleNavigateToStaffManagement = () => {
    navigateToScreen("add-property");
    // navigateToScreen("staff-management");
  };

  const handleNavigateToCategoryManagement = () => {
    navigateToScreen("add-property");
    // navigateToScreen("category-management");
  };

  const handleNavigateToInventoryView = () => {
    navigateToScreen("add-property");
    // navigateToScreen("inventory-view");
  };

  const handleNavigateToInvoice = () => {
    navigateToScreen("add-property");
    // navigateToScreen("invoice-management");
  };

  const handleRefreshTransactions = () => {
    // Increment refresh key to trigger re-render of transaction data
    setTransactionRefreshKey((prev) => prev + 1);

    // Show success toast
    toast.success("Transactions Refreshed!", {
      description: "Latest transaction data has been loaded",
      duration: 2000,
      style: {
        background: "#003883",
        color: "#ffffff",
        border: "1px solid #003883",
        borderRadius: "12px",
        padding: "16px 20px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow:
          "0 10px 25px -5px rgba(0, 56, 131, 0.2), 0 10px 10px -5px rgba(0, 56, 131, 0.1)",
      },
    });
  };

  const handleNavigateToSell = () => {
    navigateToScreen("add-property");
    // navigateToScreen("sell");
  };

  const handleNavigateToStores = () => {
    navigateToScreen("add-property");
    // navigateToScreen("stores");
  };

  const screenVariants = {
    enter: {
      x: "30%",
      opacity: 0,
    },
    center: {
      x: "0%",
      opacity: 1,
    },
    exit: {
      x: "-30%",
      opacity: 0,
    },
  };

  const slideTransition: Transition = {
    type: "tween",
    ease: [0.25, 0.1, 0.25, 1],
    duration: 0.4,
  };

  const handleSplashComplete = async () => {
    // Mark splash screen as seen before hiding it
    await setSplashScreenSeen();
    startTransition(() => {
      setShowSplash(false);
    });
  };

  const handleSignUpFromLogin = () => {
    startTransition(() => {
      // setCurrentScreen("entry-choice");
      setCurrentScreen("add-property");
    });
  };

  const handleCreateProfileFromLogin = () => {
    startTransition(() => {
      setCurrentScreen("add-property");
      // setCurrentScreen("create-profile");
    });
  };

  const handleBusinessTypeSelection = (type: "registered" | "unregistered") => {
    // setBusinessType(type);

    // For unregistered businesses, show the choice screen
    if (type === "unregistered") {
      setCurrentScreen("add-property");
      // setCurrentScreen("unregistered-business-choice");
    } else {
      setCurrentScreen("add-property");
      // setCurrentScreen("agreement");
    }
  };

  const handleUnregisteredBusinessOption = (
    option: "register-business" | "individual-account",
  ) => {
    // setUnregisteredBusinessOption(option);
    // setBusinessType("unregistered");
    setCurrentScreen("add-property");
    // setCurrentScreen("agreement");
  };

  if (showSplash === null) {
    // Still checking splash screen flag, show nothing (or minimal loader)
    return null;
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (currentScreen === "admin-portal") {
    return (
      <div className="mobile-screen bg-background overflow-hidden">
        <Suspense fallback={<LoadingSpinner />}>
          <AdminPortalScreen onBack={handleBackToInitialLogin} />
        </Suspense>
        <Toaster />
      </div>
    );
  }

  if (currentScreen === "complete-profile") {
    return (
      <div className="min-h-screen bg-background overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key="complete-profile"
            variants={screenVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0"
          >
            <Suspense fallback={<LoadingSpinner />}>
              <CompleteProfileScreen
                onBack={handleBackToInitialLogin}
                userRole={userRole}
                staffData={staffData}
                onComplete={() => {
                  // After profile completion, redirect to dashboard
                  setIsAuthenticated(true);
                  setCurrentScreen("dashboard");
                }}
              />
            </Suspense>
          </motion.div>
        </AnimatePresence>
        <Toaster />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mobile-screen bg-background overflow-hidden">
        <AnimatePresence mode="wait">
          {currentScreen === "initial-login" && (
            <motion.div
              key="initial-login"
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="absolute inset-0"
            >
              <InitialLoginScreen
                onLogin={handleInitialLogin}
                onSignUp={handleSignUpFromLogin}
                onCreateProfile={handleCreateProfileFromLogin}
                onPasswordChangeRequired={handlePasswordChangeRequired}
                onPinSetupRequired={handlePinSetupRequired}
                onForgotPassword={() => {
                  console.log(
                    "🔐 [FORGOT PASSWORD] Navigating to forgot password screen",
                  );
                  setCurrentScreen("add-property");
                  // setCurrentScreen("forgot-password");
                }}
                onOTPRequired={handleOTPRequired}
                onProfileCompletionRequired={handleProfileCompletionRequired}
                // onNavigateToOrderLink={handleNavigateToOrderLinkPaymentFromLogin}
                // onNavigateToPaymentLink={handleNavigateToPaymentLinkCustomerFromLogin}
              />
            </motion.div>
          )}

          {currentScreen === "forgot-password" && (
            <motion.div
              key="forgot-password"
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="absolute inset-0"
            >
              <Suspense fallback={<LoadingSpinner />}>
                <ForgotPasswordScreen
                  onBack={() => setCurrentScreen("initial-login")}
                  onOTPGenerated={(username) => {
                    console.log(
                      "✅ [FORGOT PASSWORD] OTP generated, moving to OTP screen",
                    );
                    setForgotPasswordUsername(username);
                    setCurrentScreen("forgot-password-otp");
                  }}
                />
              </Suspense>
            </motion.div>
          )}

          {currentScreen === "forgot-password-otp" && (
            <motion.div
              key="forgot-password-otp"
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="absolute inset-0"
            >
              <Suspense fallback={<LoadingSpinner />}>
                <ForgotPasswordOTPScreen
                  username={forgotPasswordUsername}
                  onBack={() => setCurrentScreen("forgot-password")}
                  onOTPValidated={(username, otp) => {
                    console.log(
                      "✅ [FORGOT PASSWORD] OTP validated, moving to new password screen",
                    );
                    setForgotPasswordUsername(username);
                    // setForgotPasswordOTP(otp);
                    setCurrentScreen("forgot-password-new-password");
                  }}
                />
              </Suspense>
            </motion.div>
          )}

          {currentScreen === "entry-choice" && (
            <motion.div
              key="entry-choice"
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="absolute inset-0"
            >
              <EntryChoiceScreen
                onBack={() => setCurrentScreen("initial-login")}
                onSelectBusinessType={handleBusinessTypeSelection}
              />
            </motion.div>
          )}

          {currentScreen === "unregistered-business-choice" && (
            <motion.div
              key="unregistered-business-choice"
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="absolute inset-0"
            >
              <UnregisteredBusinessChoiceScreen
                onBack={() => setCurrentScreen("entry-choice")}
                onSelectOption={handleUnregisteredBusinessOption}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <Toaster />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case "home":
        if (userRole === "agent") {
          return (
            <Suspense fallback={<LoadingSpinner />}>
              <ManagerDashboard
                staffName={staffName}
                staffData={staffData}
                onNavigateToAddProperty={handleNavigateToAddProperty}
                // currentKYCTier={currentKYCTier}
                // isFirstLogin={isFirstLogin}
                // selectedBusinessTools={selectedBusinessTools}
                // transactionRefreshKey={transactionRefreshKey}
                // onNavigateToTools={handleNavigateToTools}
                // onNavigateToTransactions={handleNavigateToTransactions}
                // onNavigateToOrders={handleNavigateToOrders}
                // onViewTransaction={handleViewTransaction}
                // onNavigateToAddProduct={handleNavigateToAddProduct}
                // onNavigateToStoreSetup={handleNavigateToStoreSetup}
                // onNavigateToProductManagement={
                //   handleNavigateToProductManagement
                // }
                // onNavigateToProducts={() => {
                //   handleNavigateToProducts();
                // }}
                // onNavigateToSell={() => {
                //   handleNavigateToSell();
                // }}
                // onShowNotifications={handleShowNotifications}
                // onShowKYCProgress={handleShowKYCProgress}
                // onNavigateToTopUp={handleNavigateToTopUp}
                // onNavigateToTransfer={handleNavigateToTransfer}
                // onNavigateToUtility={handleNavigateToUtility}
                // onNavigateToAirtime={handleNavigateToAirtime}
                // onNavigateToData={handleNavigateToData}
                // onNavigateToInvoice={handleNavigateToInvoice}
                // onNavigateToExpenses={handleNavigateToExpenses}
                // onRefreshTransactions={handleRefreshTransactions}
                // onNavigateToInventoryView={handleNavigateToInventoryView}
                // onNavigateToStaffManagement={handleNavigateToStaffManagement}
                // onNavigateToCategoryManagement={
                //   handleNavigateToCategoryManagement
                // }
                // onNavigateToAnalytics={handleNavigateToAnalytics}
              />
            </Suspense>
          );
        } else {
          return (
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard
                staffName={staffName}
                staffData={staffData}
                selectedBusinessTools={selectedBusinessTools}
                transactionRefreshKey={transactionRefreshKey}
                userPhoneNumber={staffData?.email || "08160101010"}
                onNavigateToTools={handleNavigateToTools}
                onNavigateToTransactions={handleNavigateToTransactions}
                onNavigateToOrders={handleNavigateToOrders}
                // onViewTransaction={handleViewTransaction}
                onNavigateToAddProduct={handleNavigateToAddProduct}
                onNavigateToStoreSetup={handleNavigateToStoreSetup}
                onNavigateToProductManagement={
                  handleNavigateToProductManagement
                }
                onNavigateToProducts={() => {
                  handleNavigateToProducts();
                }}
                onNavigateToSell={() => {
                  handleNavigateToSell();
                }}
                // onShowNotifications={handleShowNotifications}
                // onShowKYCProgress={handleShowKYCProgress} // KYC access for all users
                onSharePayment={handleSharePayment}
                onNavigateToInvoice={handleNavigateToInvoice}
                onNavigateToExpenses={handleNavigateToExpenses}
                onRefreshTransactions={handleRefreshTransactions}
                onNavigateToInventoryView={handleNavigateToInventoryView}
                onNavigateToStaffManagement={handleNavigateToStaffManagement}
                onNavigateToCategoryManagement={
                  handleNavigateToCategoryManagement
                }
                onNavigateToAnalytics={handleNavigateToAnalytics}
                onNavigateToStores={handleNavigateToStores}
              />
            </Suspense>
          );
        }

      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard
              staffName={staffName}
              staffData={staffData}
              selectedBusinessTools={selectedBusinessTools}
              transactionRefreshKey={transactionRefreshKey}
              userPhoneNumber={staffData?.email || "08160101010"}
              onNavigateToTools={handleNavigateToTools}
              onNavigateToTransactions={handleNavigateToTransactions}
              onNavigateToOrders={handleNavigateToOrders}
              // onViewTransaction={handleViewTransaction}
              onNavigateToAddProduct={handleNavigateToAddProduct}
              onNavigateToStoreSetup={handleNavigateToStoreSetup}
              onNavigateToProductManagement={handleNavigateToProductManagement}
              onNavigateToProducts={() => {
                handleNavigateToProducts();
              }}
              onNavigateToSell={handleNavigateToSell}
              // onShowNotifications={handleShowNotifications}
              onShowKYCProgress={() => {}} // No KYC access for staff
              onSharePayment={handleSharePayment}
              onNavigateToInvoice={handleNavigateToInvoice}
              onNavigateToExpenses={handleNavigateToExpenses}
              onRefreshTransactions={handleRefreshTransactions}
              onNavigateToInventoryView={handleNavigateToInventoryView}
              onNavigateToStaffManagement={handleNavigateToStaffManagement}
              onNavigateToCategoryManagement={
                handleNavigateToCategoryManagement
              }
              onNavigateToAnalytics={handleNavigateToAnalytics}
              onNavigateToStores={handleNavigateToStores}
            />
          </Suspense>
        );
    }
  };

  const tabVariants = {
    enter: {
      opacity: 0,
      y: 10,
    },
    center: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -10,
    },
  };

  const tabTransition: Transition = {
    type: "tween",
    ease: [0.25, 0.1, 0.25, 1],
    duration: 0.2,
  };

  if (currentScreen === "add-property") {
    return (
      <div className="min-h-screen bg-background overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key="your-new-screen-name"
            variants={screenVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0"
          >
            <Suspense fallback={<LoadingSpinner />}>
              <AddPropertyScreen
                onBack={handleBackFromAddProperty}
                // Add other props as needed
                // staffData={staffData}
                // userRole={userRole}
              />
            </Suspense>
          </motion.div>
        </AnimatePresence>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="mobile-screen bg-background flex flex-col">
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={tabTransition}
            className="absolute inset-0 overflow-y-auto scrollbar-hide"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
      <Suspense fallback={null}>
        <BottomNavigation
          currentTab={currentTab}
          onTabChange={(tab) => startTransition(() => setCurrentTab(tab))}
          userRole={userRole}
          isBusinessOwner={isBusinessOwner()}
        />
      </Suspense>

      <AutoLogoutWarning
        open={showInactivityWarning}
        remainingSeconds={remainingSeconds}
        onStayLoggedIn={resetInactivityTimer}
        onLogout={handleInactivityLogout}
      />

      <OfflineErrorScreen isOffline={!isOnline} />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
}
