import { useState, useEffect, useCallback } from "react";
import {
  BiometricAuth,
  type BiometryError,
  BiometryErrorType,
  BiometryType,
  type CheckBiometryResult,
  getBiometryName,
} from "@aparajita/capacitor-biometric-auth";
import { Capacitor } from "@capacitor/core";
import { secureStorage, securePinStorage } from "../../stores/storage";
// import { secureStorage, securePinStorage } from './storage';

export interface BiometricAuthHookResult {
  // Biometry status
  isAvailable: boolean;
  biometryType: BiometryType;
  biometryName: string;
  strongBiometryIsAvailable: boolean;
  deviceIsSecure: boolean;
  reason: string;

  // Functions
  authenticate: (
    reason?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  checkBiometry: () => Promise<void>;

  // Password storage functions (for biometric authentication)
  storePasswordSecurely: (
    username: string,
    password: string,
  ) => Promise<boolean>;
  getStoredPassword: (username: string) => Promise<string | null>;
  removeStoredPassword: (username: string) => Promise<void>;
  hasStoredPassword: (username: string) => Promise<boolean>;

  // PIN storage functions (for biometric transaction authorization)
  storePinSecurely: (username: string, pin: string) => Promise<boolean>;
  getStoredPin: (username: string) => Promise<string | null>;
  removeStoredPin: (username: string) => Promise<void>;
  hasStoredPin: (username: string) => Promise<boolean>;

  // Loading states
  isChecking: boolean;
  isAuthenticating: boolean;

  // Platform info
  isNative: boolean;
  platform: string;
}

export const useBiometricAuth = (): BiometricAuthHookResult => {
  const [biometry, setBiometry] = useState<CheckBiometryResult>({
    isAvailable: false,
    strongBiometryIsAvailable: false,
    biometryType: BiometryType.none,
    biometryTypes: [],
    deviceIsSecure: false,
    reason: "",
    code: BiometryErrorType.none,
  });

  const [isChecking, setIsChecking] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  // Get human-readable biometry name
  const biometryName =
    biometry.biometryTypes.length === 0
      ? "No biometry"
      : biometry.biometryTypes.length === 1
      ? getBiometryName(biometry.biometryType)
      : "Multiple types";

  // Check biometry availability with timeout
  const checkBiometry = useCallback(async () => {
    if (!isNative) {
      // On web, biometry is not available
      setBiometry({
        isAvailable: false,
        strongBiometryIsAvailable: false,
        biometryType: BiometryType.none,
        biometryTypes: [],
        deviceIsSecure: false,
        reason: "Biometric authentication is not supported on web platform",
        code: BiometryErrorType.none,
      });
      return;
    }

    setIsChecking(true);
    try {
      // Add timeout to prevent hanging on fresh installs
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Biometry check timeout")),
          5000,
        );
      });

      const biometryCheckPromise = BiometricAuth.checkBiometry();

      const biometryInfo = (await Promise.race([
        biometryCheckPromise,
        timeoutPromise,
      ])) as CheckBiometryResult;

      // Clear timeout if the main promise resolved first
      clearTimeout(timeoutId);

      setBiometry(biometryInfo);
      //       console.log('Biometry check result:', biometryInfo);
    } catch (error) {
      //       console.error('Failed to check biometry:', error);
      const errorMessage =
        error instanceof Error && error.message.includes("timeout")
          ? "Biometric check timed out - may not be available on fresh install"
          : "Failed to check biometric availability";

      setBiometry((prev) => ({
        ...prev,
        isAvailable: false,
        reason: errorMessage,
      }));
    } finally {
      setIsChecking(false);
    }
  }, [isNative]);

  // Authenticate with biometrics
  const authenticate = useCallback(
    async (
      reason = "Please authenticate to access your account",
    ): Promise<{ success: boolean; error?: string }> => {
      if (!isNative) {
        return {
          success: false,
          error: "Biometric authentication is not supported on web platform",
        };
      }

      if (!biometry.isAvailable) {
        return {
          success: false,
          error: biometry.reason || "Biometric authentication is not available",
        };
      }

      setIsAuthenticating(true);
      try {
        // Add timeout to prevent hanging during authentication
        let timeoutId: NodeJS.Timeout;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("Authentication timeout")),
            15000,
          );
        });

        const authPromise = BiometricAuth.authenticate({ reason });

        const bio = await Promise.race([authPromise, timeoutPromise]);

        // Clear timeout if authentication completed first
        clearTimeout(timeoutId);

        //       console.log('Biometric authentication successful :', bio);
        return { success: true };
      } catch (error) {
        //       console.error('Biometric authentication failed:', error);

        // Handle timeout errors first (these are regular Error objects)
        if (error instanceof Error && error.message.includes("timeout")) {
          return {
            success: false,
            error: "Authentication timed out. Please try again.",
          };
        }

        // Handle BiometricAuth specific errors
        const biometryError = error as BiometryError;
        let errorMessage = biometryError.message || "Authentication failed";

        if (biometryError.code === BiometryErrorType.biometryNotAvailable) {
          errorMessage =
            "Biometric authentication is not set up on this device";
        } else if (biometryError.code === BiometryErrorType.userCancel) {
          errorMessage = "Authentication was cancelled";
        }

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsAuthenticating(false);
      }
    },
    [isNative, biometry.isAvailable, biometry.reason],
  );

  // Initialize biometry check on mount
  useEffect(() => {
    checkBiometry();
  }, [checkBiometry]);

  // Password storage functions
  const storePasswordSecurely = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      if (!isNative || !biometry.isAvailable) {
        //       console.log('[useBiometricAuth] Cannot store password - biometry not available or not on native platform');
        return false;
      }

      try {
        await secureStorage.setPassword(username, password);
        return true;
      } catch (error) {
        //       console.error('[useBiometricAuth] Failed to store password:', error);
        return false;
      }
    },
    [isNative, biometry.isAvailable],
  );

  const getStoredPassword = useCallback(
    async (username: string): Promise<string | null> => {
      if (!isNative) {
        //       console.log('[useBiometricAuth] Cannot retrieve password - not on native platform');
        return null;
      }

      try {
        return await secureStorage.getPassword(username);
      } catch (error) {
        //       console.error('[useBiometricAuth] Failed to retrieve password:', error);
        return null;
      }
    },
    [isNative],
  );

  const removeStoredPassword = useCallback(
    async (username: string): Promise<void> => {
      if (!isNative) {
        return;
      }

      try {
        await secureStorage.removePassword(username);
      } catch (error) {
        //       console.error('[useBiometricAuth] Failed to remove password:', error);
      }
    },
    [isNative],
  );

  const hasStoredPassword = useCallback(
    async (username: string): Promise<boolean> => {
      if (!isNative) {
        return false;
      }

      try {
        return await secureStorage.hasPassword(username);
      } catch (error) {
        //       console.error('[useBiometricAuth] Failed to check password:', error);
        return false;
      }
    },
    [isNative],
  );

  // PIN storage functions
  const storePinSecurely = useCallback(
    async (username: string, pin: string): Promise<boolean> => {
      if (!isNative || !biometry.isAvailable) {
        //       console.log('[useBiometricAuth] Cannot store PIN - biometry not available or not on native platform');
        return false;
      }

      try {
        await securePinStorage.setPin(username, pin);
        return true;
      } catch (error) {
        //       console.error('[useBiometricAuth] Failed to store PIN:', error);
        return false;
      }
    },
    [isNative, biometry.isAvailable],
  );

  const getStoredPin = useCallback(
    async (username: string): Promise<string | null> => {
      if (!isNative) {
        //       console.log('[useBiometricAuth] Cannot retrieve PIN - not on native platform');
        return null;
      }

      try {
        return await securePinStorage.getPin(username);
      } catch (error) {
        //       console.error('[useBiometricAuth] Failed to retrieve PIN:', error);
        return null;
      }
    },
    [isNative],
  );

  const removeStoredPin = useCallback(
    async (username: string): Promise<void> => {
      if (!isNative) {
        return;
      }

      try {
        await securePinStorage.removePin(username);
      } catch (error) {
        //       console.error('[useBiometricAuth] Failed to remove PIN:', error);
      }
    },
    [isNative],
  );

  const hasStoredPin = useCallback(
    async (username: string): Promise<boolean> => {
      if (!isNative) {
        return false;
      }

      try {
        return await securePinStorage.hasPin(username);
      } catch (error) {
        //       console.error('[useBiometricAuth] Failed to check PIN:', error);
        return false;
      }
    },
    [isNative],
  );

  return {
    // Biometry status
    isAvailable: biometry.isAvailable,
    biometryType: biometry.biometryType,
    biometryName,
    strongBiometryIsAvailable: biometry.strongBiometryIsAvailable,
    deviceIsSecure: biometry.deviceIsSecure,
    reason: biometry.reason,

    // Functions
    authenticate,
    checkBiometry,

    // Password storage functions
    storePasswordSecurely,
    getStoredPassword,
    removeStoredPassword,
    hasStoredPassword,

    // PIN storage functions
    storePinSecurely,
    getStoredPin,
    removeStoredPin,
    hasStoredPin,

    // Loading states
    isChecking,
    isAuthenticating,

    // Platform info
    isNative,
    platform,
  };
};

export default useBiometricAuth;
