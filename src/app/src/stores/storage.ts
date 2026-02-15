/**
 * Unified Secure Storage Service
 *
 * Centralized storage service for all data persistence with proper aparajita API usage.
 *
 * SECURITY MODEL:
 * - Sensitive data (tokens, credentials, passwords, PINs) → SecureStorage (hardware-encrypted on native)
 * - Non-sensitive data (preferences, cache) → localStorage
 * - Web platform: Falls back to localStorage for all data
 *
 * Platform Support:
 * - iOS: Keychain (Secure Enclave) for sensitive data
 * - Android: KeyStore (Hardware Security Module) for sensitive data
 * - Web: localStorage for all data (graceful degradation)
 */

import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const STORAGE_KEYS = {
  // User Data (SENSITIVE - SecureStorage)
  USER_DATA: "habitera_user_data",
  USER: "habitera_user",
  USERNAME: "habitera_username",

  // Authentication Tokens (SENSITIVE - SecureStorage)
  AUTH_TOKEN: "auth-token",
  INAPP_TOKEN: "inapp-token",
  ACCESS_TOKEN: "habitera_token",
  REFRESH_TOKEN: "habitera_refresh_token",
  TOKEN_EXPIRY: "habitera_token_expiry",

  // SSO (SENSITIVE - SecureStorage)
  SSO_TOKEN: "sso_token",
  SSO_USER_DATA: "sso_user_data",

  // Password & PIN Storage (SENSITIVE - SecureStorage)
  USER_PASSWORD: "user_password_encrypted",
  PASSWORD_TIMESTAMP: "password_stored_timestamp",
  USER_TRANSACTION_PIN: "user_transaction_pin_encrypted",
  PIN_TIMESTAMP: "pin_stored_timestamp",

  // Biometric & Security (NON-SENSITIVE - localStorage)
  BIOMETRIC_ENABLED: "biometric-enabled",
  LAST_BIOMETRIC_LOGIN: "last_biometric_login",
  LAST_LOGIN_TIMESTAMP: "last_login_timestamp",

  // User Preferences (NON-SENSITIVE - localStorage)
  THEME: "habitera_theme",
  LANGUAGE: "habitera_language",
  LAST_SCREEN: "habitera_last_screen",

  // Cached Data (NON-SENSITIVE - localStorage)
  CACHED_PHONE: "cached-phone-number",
  CURRENT_PHONE: "habitera_current_phone",
  SELECTED_ACCOUNT_ID: "selectedAccountId",
  PENDING_PROFILE_REGISTRATION: "pendingProfileRegistration",

  // Configuration (NON-SENSITIVE - localStorage)
  BUSINESS_TOOLS_CONFIG: "business-tools-config",

  // Notifications (NON-SENSITIVE - localStorage)
  NOTIFICATION_READ_IDS: "habitera_notification_read_ids",

  // Splash Screen (NON-SENSITIVE - localStorage/Preferences)
  SPLASH_SCREEN_SEEN: "habitera_splash_screen_seen",

  // Device ID (NON-SENSITIVE - localStorage)
  DEVICE_ID: "device_id",
} as const;

// Keys that should be stored securely (hardware-encrypted on native platforms)
const SECURE_KEYS = new Set([
  STORAGE_KEYS.USER_DATA,
  STORAGE_KEYS.USER,
  STORAGE_KEYS.USERNAME,
  STORAGE_KEYS.AUTH_TOKEN,
  STORAGE_KEYS.INAPP_TOKEN,
  STORAGE_KEYS.ACCESS_TOKEN,
  STORAGE_KEYS.REFRESH_TOKEN,
  STORAGE_KEYS.SSO_TOKEN,
  STORAGE_KEYS.SSO_USER_DATA,
  STORAGE_KEYS.USER_PASSWORD,
  STORAGE_KEYS.PASSWORD_TIMESTAMP,
  STORAGE_KEYS.USER_TRANSACTION_PIN,
  STORAGE_KEYS.PIN_TIMESTAMP,
]);

// Constants
const PASSWORD_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const PIN_EXPIRATION_DAYS = 30;
const MAX_NOTIFICATION_IDS = 500;

// ============================================
// Session-Scoped Logout Flag
// Prevents auto-biometric login after explicit logout
// Resets automatically on app restart
// ============================================
let sessionExplicitLogoutFlag = false;

export const setExplicitLogoutFlag = (value: boolean): void => {
  sessionExplicitLogoutFlag = value;
};

export const wasExplicitLogout = (): boolean => {
  return sessionExplicitLogoutFlag;
};

export const clearExplicitLogoutFlag = (): void => {
  sessionExplicitLogoutFlag = false;
};

/**
 * Check if secure storage is available (native platforms only)
 */
function isSecureStorageAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Determine if a key should use secure storage
 */
function shouldUseSecureStorage(key: any): boolean {
  return SECURE_KEYS.has(key) && isSecureStorageAvailable();
}

/**
 * Save data to storage (secure or regular based on key type)
 * Uses correct aparajita API: SecureStorage.set(key, data)
 */
export const saveToStorage = async <T>(key: string, data: T): Promise<void> => {
  try {
    const value = JSON.stringify(data);

    if (shouldUseSecureStorage(key)) {
      await SecureStorage.set(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    // Fallback to localStorage on error
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (fallbackError) {
      // Silent fail - storage errors shouldn't break the app
    }
  }
};

/**
 * Get data from storage (secure or regular based on key type)
 * Uses correct aparajita API: SecureStorage.get(key)
 */
export const getFromStorage = async <T>(key: string): Promise<T | null> => {
  try {
    let item: string | null = null;

    if (shouldUseSecureStorage(key)) {
      try {
        const result = await SecureStorage.get(key);
        item = result as string;
      } catch (error) {
        // Key not found in secure storage, try localStorage as fallback for migration
        item = localStorage.getItem(key);
        if (item) {
          // Migrate to secure storage
          const data = JSON.parse(item);
          await saveToStorage(key, data);
          // Remove from localStorage after migration
          localStorage.removeItem(key);
        }
      }
    } else {
      item = localStorage.getItem(key);
    }

    return item ? JSON.parse(item) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Remove item from storage (secure or regular based on key type)
 * Uses correct aparajita API: SecureStorage.remove(key)
 */
export const removeFromStorage = async (key: string): Promise<void> => {
  try {
    if (shouldUseSecureStorage(key)) {
      await SecureStorage.remove(key);
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    // Also try removing from localStorage as fallback
    try {
      localStorage.removeItem(key);
    } catch (fallbackError) {
      // Silent fail
    }
  }
};

/**
 * Clear all app data from storage
 */
export const clearStorage = async (): Promise<void> => {
  try {
    // Clear secure storage
    if (isSecureStorageAvailable()) {
      await SecureStorage.clear();
    }

    // Clear localStorage items
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    // Silent fail - clearing is best effort
  }
};

// ============================================
// Password Storage Methods (from secureStorage.ts)
// ============================================

/**
 * Store password securely for biometric authentication
 * Uses correct aparajita API
 */
export async function setPassword(
  username: string,
  password: string,
): Promise<void> {
  if (!isSecureStorageAvailable()) {
    return;
  }

  if (!username || !username.trim() || !password || !password.trim()) {
    throw new Error("Username and password are required");
  }

  const passwordKey = `${STORAGE_KEYS.USER_PASSWORD}_${username}`;
  const timestampKey = `${STORAGE_KEYS.PASSWORD_TIMESTAMP}_${username}`;
  const timestamp = new Date().toISOString();

  try {
    // Store password and timestamp atomically
    await SecureStorage.set(passwordKey, password);

    try {
      await SecureStorage.set(timestampKey, timestamp);
    } catch (timestampError) {
      // Rollback: Remove password if timestamp storage fails
      await SecureStorage.remove(passwordKey);
      throw new Error("Failed to store password securely");
    }
  } catch (error) {
    throw new Error("Failed to store password securely");
  }
}

/**
 * Retrieve password from secure storage
 */
export async function getPassword(username: string): Promise<string | null> {
  if (!isSecureStorageAvailable() || !username || !username.trim()) {
    return null;
  }

  try {
    const passwordKey = `${STORAGE_KEYS.USER_PASSWORD}_${username}`;
    const timestampKey = `${STORAGE_KEYS.PASSWORD_TIMESTAMP}_${username}`;

    // Retrieve password
    const password = (await SecureStorage.get(passwordKey)) as string;

    // Check expiration
    try {
      const storedTimestamp = (await SecureStorage.get(timestampKey)) as string;
      const storedDate = new Date(storedTimestamp).getTime();

      if (isNaN(storedDate)) {
        await removePassword(username);
        return null;
      }

      const now = Date.now();
      if (now - storedDate > PASSWORD_MAX_AGE_MS) {
        await removePassword(username);
        return null;
      }
    } catch (timestampError) {
      // If timestamp is missing, password is still valid (backward compatibility)
    }

    return password;
  } catch (error) {
    return null;
  }
}

/**
 * Remove password from secure storage
 */
export async function removePassword(username: string): Promise<void> {
  if (!isSecureStorageAvailable() || !username) {
    return;
  }

  try {
    const passwordKey = `${STORAGE_KEYS.USER_PASSWORD}_${username}`;
    const timestampKey = `${STORAGE_KEYS.PASSWORD_TIMESTAMP}_${username}`;

    await Promise.all([
      SecureStorage.remove(passwordKey),
      SecureStorage.remove(timestampKey),
    ]);
  } catch (error) {
    // Silent fail - removal is best effort
  }
}

/**
 * Check if password exists in secure storage
 */
export async function hasPassword(username: string): Promise<boolean> {
  const password = await getPassword(username);
  return password !== null;
}

// ============================================
// PIN Storage Methods (from securePinStorage.ts)
// ============================================

/**
 * Store transaction PIN securely
 * Uses correct aparajita API
 */
export async function setPin(username: string, pin: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  if (!pin || pin.length !== 4) {
    return false;
  }

  try {
    const key = `${STORAGE_KEYS.USER_TRANSACTION_PIN}_${username}`;
    const timestampKey = `${STORAGE_KEYS.PIN_TIMESTAMP}_${username}`;
    const timestamp = new Date().toISOString();

    // Store PIN and timestamp atomically
    await SecureStorage.set(key, pin);
    await SecureStorage.set(timestampKey, timestamp);

    return true;
  } catch (error) {
    // Rollback on failure
    try {
      const key = `${STORAGE_KEYS.USER_TRANSACTION_PIN}_${username}`;
      const timestampKey = `${STORAGE_KEYS.PIN_TIMESTAMP}_${username}`;
      await SecureStorage.remove(key);
      await SecureStorage.remove(timestampKey);
    } catch (rollbackError) {
      // Silent fail
    }

    return false;
  }
}

/**
 * Retrieve transaction PIN from secure storage
 */
export async function getPin(username: string): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    const key = `${STORAGE_KEYS.USER_TRANSACTION_PIN}_${username}`;
    const timestampKey = `${STORAGE_KEYS.PIN_TIMESTAMP}_${username}`;

    const pin = (await SecureStorage.get(key)) as string;
    const timestamp = (await SecureStorage.get(timestampKey)) as string;

    if (!pin) {
      return null;
    }

    // Check expiration
    if (timestamp) {
      const storedDate = new Date(timestamp);
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - storedDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff > PIN_EXPIRATION_DAYS) {
        await removePin(username);
        return null;
      }
    }

    return pin;
  } catch (error) {
    return null;
  }
}

/**
 * Remove transaction PIN from secure storage
 */
export async function removePin(username: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const key = `${STORAGE_KEYS.USER_TRANSACTION_PIN}_${username}`;
    const timestampKey = `${STORAGE_KEYS.PIN_TIMESTAMP}_${username}`;

    await SecureStorage.remove(key);
    await SecureStorage.remove(timestampKey);
  } catch (error) {
    throw error;
  }
}

/**
 * Check if user has a stored PIN
 */
export async function hasPin(username: string): Promise<boolean> {
  const pin = await getPin(username);
  return pin !== null && pin.length === 4;
}

// ============================================
// User Data Methods
// ============================================

export const saveUserData = async (userData: any): Promise<void> => {
  await saveToStorage(STORAGE_KEYS.USER_DATA, userData);
};

export const getUserData = async (): Promise<any | null> => {
  return await getFromStorage(STORAGE_KEYS.USER_DATA);
};

export const removeUserData = async (): Promise<void> => {
  await removeFromStorage(STORAGE_KEYS.USER_DATA);
};

// ============================================
// Authentication Token Methods
// ============================================

export const setAuthToken = async (token: string): Promise<void> => {
  await saveToStorage(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const getAuthToken = async (): Promise<string | null> => {
  return await getFromStorage<string>(STORAGE_KEYS.AUTH_TOKEN);
};

export const removeAuthToken = async (): Promise<void> => {
  await removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);
};

export const setInAppToken = async (token: string): Promise<void> => {
  await saveToStorage(STORAGE_KEYS.INAPP_TOKEN, token);
};

export const getInAppToken = async (): Promise<string | null> => {
  return await getFromStorage<string>(STORAGE_KEYS.INAPP_TOKEN);
};

export const removeInAppToken = async (): Promise<void> => {
  await removeFromStorage(STORAGE_KEYS.INAPP_TOKEN);
};

export const setAccessToken = async (token: string): Promise<void> => {
  await saveToStorage(STORAGE_KEYS.ACCESS_TOKEN, token);
};

export const getAccessToken = async (): Promise<string | null> => {
  return await getFromStorage<string>(STORAGE_KEYS.ACCESS_TOKEN);
};

export const removeAccessToken = async (): Promise<void> => {
  await removeFromStorage(STORAGE_KEYS.ACCESS_TOKEN);
};

export const setRefreshToken = async (token: string): Promise<void> => {
  await saveToStorage(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return await getFromStorage<string>(STORAGE_KEYS.REFRESH_TOKEN);
};

export const removeRefreshToken = async (): Promise<void> => {
  await removeFromStorage(STORAGE_KEYS.REFRESH_TOKEN);
};

export const setTokenExpiry = (expiry: string | number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, JSON.stringify(expiry));
  } catch (error) {
    // Silent fail
  }
};

export const getTokenExpiry = (): string | number | null => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    return null;
  }
};

export const removeTokenExpiry = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  } catch (error) {
    // Silent fail
  }
};

// ============================================
// User Information Methods
// ============================================

export const setUsername = async (username: string): Promise<void> => {
  await saveToStorage(STORAGE_KEYS.USERNAME, username);
};

export const getUsername = async (): Promise<string | null> => {
  return await getFromStorage<string>(STORAGE_KEYS.USERNAME);
};

export const removeUsername = async (): Promise<void> => {
  await removeFromStorage(STORAGE_KEYS.USERNAME);
};

export const setUser = async (user: any): Promise<void> => {
  await saveToStorage(STORAGE_KEYS.USER, user);
};

export const getUser = async (): Promise<any | null> => {
  return await getFromStorage(STORAGE_KEYS.USER);
};

export const removeUser = async (): Promise<void> => {
  await removeFromStorage(STORAGE_KEYS.USER);
};

// ============================================
// Biometric & Security Methods
// ============================================

export const setBiometricEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.BIOMETRIC_ENABLED,
      JSON.stringify(enabled),
    );
  } catch (error) {
    // Silent fail
  }
};

export const getBiometricEnabled = (): boolean => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return item ? JSON.parse(item) === true : false;
  } catch (error) {
    return false;
  }
};

export const removeBiometricEnabled = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
  } catch (error) {
    // Silent fail
  }
};

export const setLastBiometricLogin = (timestamp: number): void => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.LAST_BIOMETRIC_LOGIN,
      JSON.stringify(timestamp),
    );
  } catch (error) {
    // Silent fail
  }
};

export const getLastBiometricLogin = (): number | null => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.LAST_BIOMETRIC_LOGIN);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    return null;
  }
};

export const removeLastBiometricLogin = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.LAST_BIOMETRIC_LOGIN);
  } catch (error) {
    // Silent fail
  }
};

export const setLastLoginTimestamp = (timestamp: number): void => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.LAST_LOGIN_TIMESTAMP,
      JSON.stringify(timestamp),
    );
  } catch (error) {
    // Silent fail
  }
};

export const getLastLoginTimestamp = (): number | null => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN_TIMESTAMP);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    return null;
  }
};

export const removeLastLoginTimestamp = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN_TIMESTAMP);
  } catch (error) {
    // Silent fail
  }
};

// ============================================
// Cached Data Methods
// ============================================

export const setCachedPhone = (phone: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CACHED_PHONE, JSON.stringify(phone));
  } catch (error) {
    // Silent fail
  }
};

export const getCachedPhone = (): string | null => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.CACHED_PHONE);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    return null;
  }
};

export const removeCachedPhone = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CACHED_PHONE);
  } catch (error) {
    // Silent fail
  }
};

export const setCurrentPhone = (phone: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PHONE, JSON.stringify(phone));
  } catch (error) {
    // Silent fail
  }
};

export const getCurrentPhone = (): string | null => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.CURRENT_PHONE);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    return null;
  }
};

export const removeCurrentPhone = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PHONE);
  } catch (error) {
    // Silent fail
  }
};

export const setSelectedAccountId = (accountId: string): void => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.SELECTED_ACCOUNT_ID,
      JSON.stringify(accountId),
    );
  } catch (error) {
    // Silent fail
  }
};

export const getSelectedAccountId = (): string | null => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.SELECTED_ACCOUNT_ID);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    return null;
  }
};

export const removeSelectedAccountId = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ACCOUNT_ID);
  } catch (error) {
    // Silent fail
  }
};

// ============================================
// Pending Profile Registration Methods
// ============================================

export interface PendingProfileData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber: string;
  timestamp?: number;
}

export const savePendingProfileData = (
  formData: Omit<PendingProfileData, "timestamp">,
): void => {
  try {
    const data: PendingProfileData = {
      ...formData,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      STORAGE_KEYS.PENDING_PROFILE_REGISTRATION,
      JSON.stringify(data),
    );
  } catch (error) {
    // Silent fail
  }
};

export const getPendingProfileData = (): PendingProfileData | null => {
  try {
    const item = localStorage.getItem(
      STORAGE_KEYS.PENDING_PROFILE_REGISTRATION,
    );
    if (!item) return null;

    const data: PendingProfileData = JSON.parse(item);

    // Optional: Check expiration (24 hours)
    if (data.timestamp) {
      const age = Date.now() - data.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (age > maxAge) {
        clearPendingProfileData();
        return null;
      }
    }

    return data;
  } catch (error) {
    return null;
  }
};

export const clearPendingProfileData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PENDING_PROFILE_REGISTRATION);
  } catch (error) {
    // Silent fail
  }
};

// ============================================
// Configuration Methods
// ============================================

export const setBusinessToolsConfig = (config: any): void => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.BUSINESS_TOOLS_CONFIG,
      JSON.stringify(config),
    );
  } catch (error) {
    // Silent fail
  }
};

export const getBusinessToolsConfig = (): any | null => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.BUSINESS_TOOLS_CONFIG);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    return null;
  }
};

export const removeBusinessToolsConfig = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.BUSINESS_TOOLS_CONFIG);
  } catch (error) {
    // Silent fail
  }
};

// ============================================
// SSO Methods
// ============================================

export const setSSOToken = async (token: string): Promise<void> => {
  await saveToStorage(STORAGE_KEYS.SSO_TOKEN, token);
};

export const getSSOToken = async (): Promise<string | null> => {
  return await getFromStorage<string>(STORAGE_KEYS.SSO_TOKEN);
};

export const removeSSOToken = async (): Promise<void> => {
  await removeFromStorage(STORAGE_KEYS.SSO_TOKEN);
};

export const setSSOUserData = async (userData: any): Promise<void> => {
  await saveToStorage(STORAGE_KEYS.SSO_USER_DATA, userData);
};

export const getSSOUserData = async (): Promise<any | null> => {
  return await getFromStorage(STORAGE_KEYS.SSO_USER_DATA);
};

export const removeSSOUserData = async (): Promise<void> => {
  await removeFromStorage(STORAGE_KEYS.SSO_USER_DATA);
};

// ============================================
// Notification Methods
// ============================================

export const getNotificationReadIds = (): string[] => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_READ_IDS);
    const ids = item ? JSON.parse(item) : [];
    return ids.slice(-MAX_NOTIFICATION_IDS);
  } catch (error) {
    return [];
  }
};

export const setNotificationReadIds = (ids: string[]): void => {
  try {
    const limitedIds = ids.slice(-MAX_NOTIFICATION_IDS);
    localStorage.setItem(
      STORAGE_KEYS.NOTIFICATION_READ_IDS,
      JSON.stringify(limitedIds),
    );
  } catch (error) {
    throw error;
  }
};

export const addNotificationReadId = (id: string): void => {
  try {
    const currentIds = getNotificationReadIds();
    if (!currentIds.includes(id)) {
      const newIds = [...currentIds, id];
      setNotificationReadIds(newIds);
    }
  } catch (error) {
    throw error;
  }
};

export const addNotificationReadIds = (ids: string[]): void => {
  try {
    const currentIds = getNotificationReadIds();
    const newIds = [...new Set([...currentIds, ...ids])];
    setNotificationReadIds(newIds);
  } catch (error) {
    throw error;
  }
};

export const removeNotificationReadIds = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_READ_IDS);
  } catch (error) {
    // Silent fail
  }
};

// ============================================
// Splash Screen Methods
// ============================================

/**
 * Check if user has seen the splash screen
 * Uses Capacitor Preferences on native, localStorage on web
 */
export const hasSeenSplashScreen = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Preferences on native platforms
      try {
        const { value } = await Preferences.get({
          key: STORAGE_KEYS.SPLASH_SCREEN_SEEN,
        });
        return value === "true";
      } catch (error) {
        // Fallback to localStorage if Preferences fails
        const item = localStorage.getItem(STORAGE_KEYS.SPLASH_SCREEN_SEEN);
        return item === "true";
      }
    } else {
      // Use localStorage on web
      const item = localStorage.getItem(STORAGE_KEYS.SPLASH_SCREEN_SEEN);
      return item === "true";
    }
  } catch (error) {
    // Default to false (show splash) on error
    return false;
  }
};

/**
 * Mark splash screen as seen
 * Uses Capacitor Preferences on native, localStorage on web
 */
export const setSplashScreenSeen = async (): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Preferences on native platforms
      try {
        await Preferences.set({
          key: STORAGE_KEYS.SPLASH_SCREEN_SEEN,
          value: "true",
        });
      } catch (error) {
        // Fallback to localStorage if Preferences fails
        localStorage.setItem(STORAGE_KEYS.SPLASH_SCREEN_SEEN, "true");
      }
    } else {
      // Use localStorage on web
      localStorage.setItem(STORAGE_KEYS.SPLASH_SCREEN_SEEN, "true");
    }
  } catch (error) {
    // Silent fail - storage errors shouldn't break the app
  }
};

// ============================================
// Utility Methods
// ============================================

export const getAllStorageKeys = (): string[] => {
  try {
    return Object.keys(localStorage);
  } catch (error) {
    return [];
  }
};

export const clearAllStorage = async (): Promise<void> => {
  try {
    if (isSecureStorageAvailable()) {
      await SecureStorage.clear();
    }
    localStorage.clear();
  } catch (error) {
    // Silent fail
  }
};

export const clearAuthData = async (): Promise<void> => {
  await removeAuthToken();
  await removeInAppToken();
  await removeAccessToken();
  await removeRefreshToken();
  removeTokenExpiry();
  await removeUserData();
  await removeUser();
  await removeUsername();
  await removeSSOToken();
  await removeSSOUserData();
  removeNotificationReadIds();
};

export const hasKey = async (key: string): Promise<boolean> => {
  try {
    if (shouldUseSecureStorage(key)) {
      try {
        await SecureStorage.get(key);
        return true;
      } catch {
        return localStorage.getItem(key) !== null;
      }
    } else {
      return localStorage.getItem(key) !== null;
    }
  } catch (error) {
    return false;
  }
};

// ============================================
// Backward Compatibility Exports
// ============================================

export { STORAGE_KEYS };

// Legacy exports for password storage
export const secureStorage = {
  setPassword,
  getPassword,
  removePassword,
  hasPassword,
  clearAll: clearStorage,
  isAvailable: isSecureStorageAvailable,
};

// Legacy exports for PIN storage
export const securePinStorage = {
  setPin,
  getPin,
  removePin,
  hasPin,
  clearAll: clearStorage,
};

export default secureStorage;
