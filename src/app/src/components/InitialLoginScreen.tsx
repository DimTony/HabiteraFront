import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Fingerprint,
  User,
  Shield,
  Lock,
  Download,
  X,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import React from "react";
import {
  getUsername,
  setUsername as setStoredUsername,
  removeUsername,
  removeUserData,
  removeCurrentPhone,
  getBiometricEnabled,
  wasExplicitLogout,
  clearExplicitLogoutFlag,
} from "../stores/storage";
import useBiometricAuth from "../hooks/auth/useBiometricAuth";
import { getOverridesForComponent } from "../utils/overrides";
import { FloatingLabelInput } from "./FloatingLabelInput";

interface InitialLoginScreenProps {
  onBack?: () => void;
  onLogin: (credentials: {
    identifier: string;
    password: string;
    isReturningUser?: boolean;
  }) => void;
  onSignUp: () => void;
  onCreateProfile?: () => void;
  onPasswordChangeRequired?: (response: any) => void;
  onPinSetupRequired?: (response: any) => void;
  onForgotPassword?: () => void;
  onOTPRequired?: (data: {
    username: string;
    phoneNumber?: string;
    credentials: {
      username: string;
      password: string;
      cachedUsername: string;
      isReturningUser: boolean;
    };
  }) => void;
  onProfileCompletionRequired?: (data: {
    username: string;
    phoneNumber?: string;
    credentials: {
      username: string;
      password: string;
      cachedUsername: string;
      isReturningUser: boolean;
    };
  }) => void;
}

export function InitialLoginScreen({
  onBack,
  onLogin,
  onSignUp,
  onCreateProfile,
  onPasswordChangeRequired,
  onPinSetupRequired,
  onForgotPassword,
  onOTPRequired,
  onProfileCompletionRequired,
}: InitialLoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cachedUsername, setCachedUsername] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [hasTriggeredBiometric, setHasTriggeredBiometric] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [privacyPolicyLoading, setPrivacyPolicyLoading] = useState(true);
  const [showNdprConsent, setShowNdprConsent] = useState(false);
  const [ndprConsentAccepted, setNdprConsentAccepted] = useState(false);

  // Removed: Unnecessary initialization state

  // Use ref to track auto-trigger attempts (persists across re-renders without causing re-renders)
  const hasAttemptedAutoTrigger = useRef(false);

  // Track component mounted state to prevent updates after unmount
  const isMountedRef = useRef(true);

  // Initialize biometric authentication
  const {
    isAvailable: biometricAvailable,
    authenticate: performBiometricAuth,
    biometryName,
    isNative,
    storePasswordSecurely,
    getStoredPassword,
    removeStoredPassword,
  } = useBiometricAuth();

  // ============ Get Override Handlers ============
  const overrides = getOverridesForComponent(
    "InitialLoginScreen",
  ) as typeof import("../api/services/login.service");

  // ============ Event Handlers (Check for Overrides Inside) ============

  const handleLoginSubmit = async () => {
    // Prevent simultaneous authentication attempts
    if (isLoading) {
      //       console.log('⚠️ Login already in progress, ignoring duplicate request');
      return;
    }

    const currentFormData = {
      username,
      password,
      cachedUsername,
      isReturningUser,
    };

    // Mark that we've attempted authentication (prevents auto-biometric race)
    setHasTriggeredBiometric(true);

    // Use override handler if available
    if (overrides?.handleLoginSubmit) {
      try {
        await overrides.handleLoginSubmit(
          currentFormData,
          onLogin,
          setIsLoading,
          { storePasswordSecurely },
          onPasswordChangeRequired,
          onPinSetupRequired,
          onOTPRequired,
          onProfileCompletionRequired,
        );
        return;
      } catch (error) {
        // Extract error message from error object
        const apiError = error as any;
        const errorData = apiError?.data || apiError?.response?.data;
        const errorMsg = apiError?.message || "";

        // Use error.data if available (contains actual API error message)
        let errorMessage = "Unknown error";
        if (errorData && typeof errorData === "string") {
          errorMessage = errorData;
        } else if (
          errorData?.message &&
          typeof errorData.message === "string"
        ) {
          errorMessage = errorData.message;
        } else if (errorData?.data && typeof errorData.data === "string") {
          errorMessage = errorData.data;
        } else if (error instanceof Error) {
          errorMessage = errorMsg || error.message;
        }

        //         console.log('🔄 API Override failed, falling back to mock implementation:', errorMessage);
        // Show error toast instead of alert
        toast.error("Login Failed", {
          description: errorMessage,
        });
        setIsLoading(false);
        // Fall through to original implementation below
      }
    }

    // Original AI implementation (fallback)
    const finalUsername = isReturningUser ? cachedUsername : username;

    if (!finalUsername.trim() || !password.trim()) {
      return;
    }

    // setIsLoading(true);

    // // Simulate login process
    // await new Promise(resolve => setTimeout(resolve, 1500));

    // // Cache username for next time
    // setStoredUsername(finalUsername);

    // // Pass along whether this is a returning user to determine the flow
    // onLogin({
    //   identifier: finalUsername,
    //   password,
    //   isReturningUser
    // });
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLoginSubmit();
    }
  };

  // Handle username change with user switching detection
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);

    // Detect user switching: if user is marked as returning but typed username differs from cached
    if (
      isReturningUser &&
      cachedUsername &&
      newUsername &&
      newUsername.trim() !== cachedUsername.trim()
    ) {
      //       console.log('🔄 User switching detected: cached =', sanitizeForLog(cachedUsername), ', typed =', sanitizeForLog(newUsername));

      // User is trying to login as a different user - reset returning user state
      setIsReturningUser(false);

      // Clear cached data to prevent contamination
      removeUsername();
      removeUserData();
      removeCurrentPhone();

      // Reset biometric state for new user
      setHasTriggeredBiometric(false);
      hasAttemptedAutoTrigger.current = false;

      toast.info("Switching Users", {
        description: `Logging in as ${newUsername}`,
        duration: 2000,
      });
    }
  };

  const handleUserSwitch = async () => {
    // Use override handler if available for proper cleanup
    if (overrides?.handleUserSwitch) {
      try {
        await overrides.handleUserSwitch(() => {
          // Clear local state after override cleanup
          setCachedUsername("");
          setUsername("");
          setPassword("");
          setIsReturningUser(false);
          setHasTriggeredBiometric(false); // Reset for next user
          hasAttemptedAutoTrigger.current = false; // Reset ref for next user
        });
        return;
      } catch (error) {
        //         console.error('Override handleUserSwitch failed:', error);
        // Fall through to original implementation
      }
    }

    // Original implementation (fallback)
    removeUsername();
    setCachedUsername("");
    setUsername("");
    setPassword("");
    setIsReturningUser(false);
    setHasTriggeredBiometric(false); // Reset for next user
    hasAttemptedAutoTrigger.current = false; // Reset ref for next user
  };

  const handleBiometricAuthentication = async () => {
    //alert('Biometric Authentication');
    //     console.log('🔐 [BIOMETRIC] Authentication started', {
    //       isLoading,
    //       isNative,
    //       biometricAvailable,
    //       cachedUsername,
    //       hasTriggeredBiometric,
    //       timestamp: new Date().toISOString()
    //     });

    // Check if component is still mounted
    if (!isMountedRef.current) {
      //       console.log('⚠️ Component unmounted, aborting biometric authentication');
      return;
    }

    // Prevent simultaneous authentication attempts
    if (isLoading) {
      //       console.log('⚠️ Authentication already in progress, ignoring duplicate biometric request');
      return;
    }

    // Add timeout to prevent hanging on biometric authentication
    let hasTimedOut = false;
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current && !hasTimedOut) {
        hasTimedOut = true;
        //         console.log('⏰ Biometric authentication timed out');
        toast.error("Authentication Timeout", {
          description:
            "Biometric authentication took too long. Please try again.",
        });
        setIsLoading(false);
        setHasTriggeredBiometric(false);
      }
    }, 20000); // 20 second timeout

    try {
      await handleBiometricAuthenticationCore();
      hasTimedOut = true; // Prevent timeout from firing if completed successfully
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleBiometricAuthenticationCore = async () => {
    // Mark that biometric has been triggered
    setHasTriggeredBiometric(true);

    // Use override handler if available
    if (overrides?.handleBiometricAuthentication) {
      try {
        await overrides.handleBiometricAuthentication(
          { cachedUsername },
          onLogin,
          {
            isAvailable: biometricAvailable,
            authenticate: performBiometricAuth,
            isNative,
            getStoredPassword,
            removeStoredPassword,
            storePasswordSecurely,
          },
          setIsLoading,
          setHasTriggeredBiometric,
        );
        return;
      } catch (error) {
        // Check mounted state before updating state
        if (isMountedRef.current) {
          setHasTriggeredBiometric(false);
        }
      }
    } else {
      // If no override available, show error
      toast.error("Biometric authentication not configured");
      setHasTriggeredBiometric(false);
    }
  };

  // ============ Load Cached Username on Mount ============
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedUsername = await getUsername();

        // Check if component is still mounted before updating state
        if (!isMountedRef.current) return;

        if (savedUsername) {
          setCachedUsername(savedUsername);
          setUsername(savedUsername);
          setIsReturningUser(true);
        }
      } catch (error) {
        // Ignore credential load errors - user can still login manually
      }
    };

    loadCredentials();
  }, []); // Run only once on mount

  // ============ Simplified Auto-Trigger Biometric Authentication ============
  // Trigger biometric auth when cached username is loaded and conditions are met
  useEffect(() => {
    // Simple conditions: if cached username exists and biometric is available, try to authenticate once
    if (
      cachedUsername &&
      isReturningUser &&
      biometricAvailable &&
      isNative &&
      !isLoading &&
      !hasAttemptedAutoTrigger.current
    ) {
      const triggerBiometricAuth = async () => {
        // Mark as attempted immediately to prevent duplicate triggers
        hasAttemptedAutoTrigger.current = true;

        // Skip auto-trigger after explicit logout to prevent login loop
        if (wasExplicitLogout()) {
          clearExplicitLogoutFlag(); // Reset for next app launch
          return;
        }

        try {
          // Check if biometric is enabled in settings
          const biometricEnabled = getBiometricEnabled();
          if (!biometricEnabled) return;

          // Check if user has stored credentials
          if (!getStoredPassword) return;
          const hasStoredCreds = await getStoredPassword(cachedUsername);
          if (!hasStoredCreds) return;

          // All conditions met - trigger biometric authentication
          setHasTriggeredBiometric(true);
          requestAnimationFrame(() => {
            if (isMountedRef.current) {
              handleBiometricAuthentication();
            }
          });
        } catch (error) {
          // Don't trigger biometric on error
        }
      };

      triggerBiometricAuth();
    }
  }, [cachedUsername, biometricAvailable, isNative]); // Simple, essential dependencies

  // Cleanup effect to track component mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      //       console.log('🚀 [INIT] Component unmounting, cleanup complete');
    };
  }, []);

  const isFormValid = () => {
    const finalUsername = isReturningUser ? cachedUsername : username;
    return finalUsername.trim() && password.trim();
  };

  const handleSignUpClick = () => {
    // Show NDPR consent modal before proceeding to sign up
    setShowNdprConsent(true);
  };

  const handleNdprConsentAccept = () => {
    setNdprConsentAccepted(true);
    setShowNdprConsent(false);
    // Proceed to sign up flow
    onSignUp();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {onBack && (
        <div className="flex items-center p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-700 hover:bg-gray-50 p-3 rounded-2xl transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center px-6 py-4 max-w-md mx-auto w-full space-y-5">
        <div className="flex justify-center">
          <motion.div
            className="bg-white rounded-3xl p-3 border border-gray-100"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1.0],
            }}
          >
            <img
              src={"/vite.svg"}
              alt="Logo"
              className="h-20 w-auto object-contain"
            />
          </motion.div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center bg-gray-50/50 rounded-xl py-3 px-4 border border-gray-100 relative">
            <div className="text-center">
              <h1 className="text-lg text-gray-900 font-semibold tracking-tight">
                {isReturningUser
                  ? `Welcome ${cachedUsername}`
                  : "Habitera Login"}
              </h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                {isReturningUser
                  ? "Habitera Account"
                  : "Welcome to the mock Business App"}
              </p>
            </div>

            {isReturningUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUserSwitch}
                className="absolute right-3 text-gray-500 hover:text-primary hover:bg-primary/5 p-2 h-auto rounded-lg transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50/50 rounded-2xl p-4 space-y-3">
            {!isReturningUser && (
              <div>
                <FloatingLabelInput
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  onKeyPress={handleKeyPress}
                  label="Username"
                  style={{ fontSize: "16px" }}
                />
              </div>
            )}

            <div className="relative">
              <FloatingLabelInput
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                label="Password"
                className="pr-12"
                style={{ fontSize: "16px" }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary hover:bg-primary/5 p-2 h-auto rounded-lg transition-all duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
            </div>

            <div className="text-right pt-1">
              <Button
                variant="ghost"
                onClick={onForgotPassword}
                className="text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto font-semibold underline-offset-4 hover:underline text-sm"
                disabled={isLoading}
              >
                Forgot Password?
              </Button>
            </div>
          </div>

          <Button
            onClick={handleLoginSubmit}
            disabled={isLoading || !isFormValid()}
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white font-bold rounded-xl disabled:opacity-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] min-h-[52px] h-14"
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing You In...</span>
              </div>
            ) : (
              <span>Login</span>
            )}
          </Button>

          {/* {onCreateProfile && (
              <div className="text-center pt-2">
                <span className="text-gray-500 text-sm">Don't have a Habitera profile? </span>
                <Button
                  variant="ghost"
                  onClick={onCreateProfile}
                  className="text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto font-semibold underline-offset-4 hover:underline text-sm"
                  disabled={isLoading}
                >
                  Link Access Account
                </Button>
              </div>
            )} */}
        </div>

        <div className="text-center bg-gray-50 rounded-xl p-4 border border-gray-100">
          <span className="text-gray-700 font-medium text-sm">
            New to Habitera?{" "}
          </span>
          <Button
            variant="ghost"
            onClick={handleSignUpClick}
            className="text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto font-bold underline-offset-4 hover:underline ml-1 text-sm"
          >
            Create Account
          </Button>
        </div>

        {isReturningUser && biometricAvailable && (
          <div className="flex flex-col items-center ">
            <motion.div
              className="relative mb-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1.0,
                delay: 0.4,
                ease: [0.25, 0.1, 0.25, 1.0],
              }}
            >
              {/* Compact animated rings */}
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/8 animate-pulse"></div>
              <div
                className="absolute inset-1 w-18 h-18 rounded-full bg-primary/4 animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>

              <motion.div
                animate={
                  isReturningUser
                    ? {
                        y: [0, -8, 0],
                      }
                    : {}
                }
                transition={
                  isReturningUser
                    ? {
                        duration: 2.0,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 1.5,
                      }
                    : {}
                }
              >
                <Button
                  onClick={
                    isReturningUser ? handleBiometricAuthentication : () => {}
                  }
                  disabled={isLoading || !isReturningUser}
                  className="w-20 h-20 bg-gradient-to-br from-primary via-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 disabled:from-gray-300 disabled:to-gray-200 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 hover:scale-105 shadow-md"
                >
                  <Fingerprint className="w-8 h-8 text-white" />
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="text-center bg-gray-50 rounded-lg px-4 py-2 border border-gray-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.6,
                ease: [0.25, 0.1, 0.25, 1.0],
              }}
            >
              <p className="font-bold text-gray-800 text-xs">
                {isReturningUser ? "Touch ID" : "Biometric Security"}
              </p>
              <p className="text-xs text-gray-600 font-medium">
                {isReturningUser
                  ? "Tap for quick access"
                  : "Available after login"}
              </p>
            </motion.div>
          </div>
        )}
      </div>

      <div className="px-6 pb-4 pt-2">
        <div className="flex justify-center mb-2">
          <button
            onClick={() => {
              setShowPrivacyPolicy(true);
              setPrivacyPolicyLoading(true);
            }}
            className="text-primary text-sm font-medium hover:underline flex items-center gap-1.5 px-4 py-2 rounded-xl active:bg-primary/10 transition-colors min-h-[44px]"
          >
            Privacy Policy
            <Shield className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CBN License Text */}
        <p className="text-center text-xs text-gray-400">
          Habitera Inc. Licensed by the John Wick
        </p>
      </div>

      <Sheet open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy}>
        <SheetContent
          side="bottom"
          className="bg-white rounded-t-3xl border-0 h-[90vh] p-0 flex flex-col"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <SheetHeader className="flex-1">
              <SheetTitle className="text-center text-gray-900 text-base font-semibold">
                Privacy Policy
              </SheetTitle>
            </SheetHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrivacyPolicy(false)}
              className="absolute right-2 top-2 h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-500" />
            </Button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {/* Loading Overlay */}
            {privacyPolicyLoading && (
              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-sm text-gray-500">
                  Loading Privacy Policy...
                </p>
              </div>
            )}

            {/* iframe for in-app web content */}
            <iframe
              src="https://www.accessbankplc.com/privacy-policy"
              className="w-full h-full border-0"
              title="Access Bank Privacy Policy"
              onLoad={() => setPrivacyPolicyLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>

          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <a
              href="https://www.accessbankplc.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-primary text-sm font-medium hover:underline py-2"
            >
              Open in Browser
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showNdprConsent} onOpenChange={setShowNdprConsent}>
        <SheetContent
          side="bottom"
          className="bg-white rounded-t-3xl border-0 h-[85vh] p-0 flex flex-col"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <SheetHeader className="flex-1">
              <SheetTitle className="text-center text-gray-900 text-lg font-bold">
                Data Privacy Consent
              </SheetTitle>
            </SheetHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNdprConsent(false)}
              className="absolute right-2 top-2 h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-500" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Shield Icon */}
            <div className="flex justify-center">
              <div className="bg-primary/10 rounded-full p-4">
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>

            {/* Main Text */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Nigeria Data Protection Regulation (NDPR) Compliance
              </h3>

              <p className="text-sm text-gray-700 leading-relaxed">
                Before you proceed with creating your Access Bank SME account,
                we need your consent to collect, process, and store your
                personal data in accordance with the Nigeria Data Protection
                Regulation (NDPR) 2019.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">
                  We will collect and process:
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Personal identification information (BVN, NIN, name, date
                      of birth)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Business information (registration details, ownership
                      structure)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Contact details (email, phone number, address)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Financial information (turnover estimates, transaction
                      data)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Biometric data (facial recognition for liveness
                      verification)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Supporting documents (CAC certificate, utility bills, ID
                      documents)
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary/5 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm">
                  Your data will be used for:
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Account opening and KYC verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Risk assessment and compliance checks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Regulatory reporting to CBN, FIRS, and other authorities
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Service delivery and customer support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Fraud prevention and security</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm">
                  Your Rights:
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  You have the right to access, correct, or delete your personal
                  data. You can withdraw consent at any time, subject to legal
                  and contractual restrictions. For data privacy concerns,
                  contact our Data Protection Officer at{" "}
                  <span className="font-semibold text-primary">
                    dpo@accessbankplc.com
                  </span>
                </p>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                By clicking "I Accept", you acknowledge that you have read and
                understood this notice and consent to the collection,
                processing, and storage of your personal data as described
                above.
              </p>
            </div>
          </div>

          {/* Footer with Consent Checkbox and Accept Button */}
          <div className="px-6 py-4 border-t border-gray-100 bg-white space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ndprConsentAccepted}
                onChange={(e) => setNdprConsentAccepted(e.target.checked)}
                className="mt-0.5 w-6 h-6 min-w-[24px] rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                style={{ accentColor: "#003883" }}
              />
              <span className="text-sm text-gray-700 font-medium">
                I consent to the collection, processing, and storage of my
                personal data in accordance with the Nigeria Data Protection
                Regulation (NDPR)
              </span>
            </label>

            <Button
              onClick={handleNdprConsentAccept}
              disabled={!ndprConsentAccepted}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white font-bold rounded-xl disabled:opacity-50 transition-all duration-300 min-h-[52px]"
            >
              I Accept & Continue
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShowNdprConsent(false)}
              className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 font-medium rounded-xl min-h-[44px]"
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
