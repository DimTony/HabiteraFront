import { create } from 'zustand';
import { persist, subscribeWithSelector, type StateStorage } from 'zustand/middleware';
import queryClient from '../api/services/queryClient';
import {
  setAuthToken,
  removeAuthToken,
  saveToStorage,
  getFromStorage,
  removeFromStorage,
} from "./storage";
import type { UserRole } from '../types/common.types';
import type { LoginUserData } from '../types/api.types';

// ==============================================
// SECURE STORAGE ADAPTER FOR ZUSTAND
// ==============================================

/**
 * Custom storage adapter that wraps our async SecureStorage functions
 * for use with Zustand's persist middleware.
 *
 * This ensures auth state is stored in hardware-backed secure storage
 * (iOS Keychain / Android KeyStore) instead of plain localStorage.
 */
const secureStorageAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await getFromStorage<any>(name);
      return value ? JSON.stringify(value) : null;
    } catch (error) {
      console.error(`[SecureStorageAdapter] Error getting ${name}:`, error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      // Handle both stringified and object values from Zustand
      // (Zustand should pass strings, but sometimes passes objects during partial updates)
      let parsedValue;
      if (typeof value === 'string') {
        parsedValue = JSON.parse(value);
      } else {
        // Value is already an object (shouldn't happen but does)
        parsedValue = value;
      }
      await saveToStorage(name, parsedValue);
    } catch (error) {
      console.error(`[SecureStorageAdapter] Error setting ${name}:`, error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await removeFromStorage(name);
    } catch (error) {
      console.error(`[SecureStorageAdapter] Error removing ${name}:`, error);
    }
  },
};

// ==============================================
// TYPE DEFINITIONS
// ==============================================

/**
 * User data from API login response
 */

/**
 * App-specific user role mapping
 * - business-owner: Full access, can create staff, approve expenses, manage PIN
 *   (Note: API 'Manager' role is mapped to 'business-owner' for consolidation)
 * - staff: Basic access, creates expenses/transactions
 */
// export type UserRole = 'business-owner' | 'staff';

/**
 * Auth store state and actions
 */
interface AuthState {
  // ============ STATE ============
  user: LoginUserData | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  lastLoginTimestamp: string | null;
  lastActivityTimestamp: string | null;

  // ============ COMPUTED GETTERS ============
  /**
   * Get customer ID with fallback priority:
   * 1. customerId from user
   * 2. id from user (for new users)
   * 3. phone from user (for users without customerId)
   * 4. null
   */
  getCustomerId: () => string | null;

  /**
   * Get mapped user role for app consumption
   * Maps API roles to app's UserRole type:
   * - "BusinessOwner" OR "Manager" -> "business-owner" (consolidated)
   * - Everything else -> "staff"
   */
  getUserRole: () => UserRole;

  /**
   * Get user's position/title
   */
  getPosition: () => string;

  /**
   * Check if user is a business owner (includes Manager for consolidated roles)
   */
  isBusinessOwner: () => boolean;

  /**
   * Check if user is a staff member
   */
  isStaff: () => boolean;

  /**
   * Get account type
   */
  getAccountType: () => string | null;

  /**
   * Check if user has business account (accountType === "CORP")
   */
  isBusinessAccount: () => boolean;

  // ============ ACTIONS ============
  /**
   * Login user and store auth data
   */
  login: (userData: LoginUserData, token: string, refreshToken: string) => Promise<void>;

  /**
   * Logout user and clear auth data
   */
  logout: () => Promise<void>;

  /**
   * Update user data (partial update)
   */
  updateUser: (userData: Partial<LoginUserData>) => void;

  /**
   * Update token (for refresh)
   */
  updateToken: (token: string, refreshToken?: string) => Promise<void>;

  /**
   * Update last activity timestamp (for inactivity tracking)
   */
  updateLastActivity: () => void;

  /**
   * Check if session is valid (not expired)
   */
  isSessionValid: () => boolean;
}

// ==============================================
// AUTH STORE
// ==============================================

/**
 * Global authentication store using Zustand
 *
 * Features:
 * - Automatic persistence to localStorage
 * - Type-safe state management
 * - Computed getters for derived values
 * - Centralized auth logic
 *
 * Usage:
 * ```tsx
 * // In components
 * const { user, isAuthenticated, login, logout } = useAuthStore();
 *
 * // Get specific values
 * const customerId = useAuthStore((state) => state.getCustomerId());
 * const userRole = useAuthStore((state) => state.getUserRole());
 *
 * // Outside React components
 * const customerId = useAuthStore.getState().getCustomerId();
 * ```
 */
export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ============ INITIAL STATE ============
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        lastLoginTimestamp: null,
        lastActivityTimestamp: null,

      // ============ COMPUTED GETTERS ============

      getCustomerId: () => {
        const user = get().user;
        if (!user) return null;

        // Priority 1: Use customerId if it exists and is not null/empty
        // if (user.customerId && user.customerId !== 'null' && user.customerId !== '') {
        //   return user.customerId;
        // }

        // Priority 2: Use id if it's a valid value (not 0 or '0')
        if (user.id && user.id !== '0') {
          return user.id?.toString();
        }

        // Priority 3: Use phone number as fallback for new users
        // if (user.phone) {
        //   console.log('⚠️ Using phone number as customer identifier for user:', user.fullName);
        //   return user.phone;
        // }

        return null;
      },

      getUserRole: () => {
        const user = get().user;
        if (!user) return 'user';

        // Map API roles to app UserRole type (2 distinct roles)
        // Both BusinessOwner and Manager map to 'business-owner' (consolidated)
        if (user.role === 'Agent') {
          return 'agent';
        }
        return 'user';
      },

      getPosition: () => {
        const user = get().user;
        if (!user) return 'Guest';

        // Return position based on role
        // Both BusinessOwner and Manager return 'Business Owner' (consolidated)
        if (user.role === 'Agent') {
          return 'Agent';
        }
        return 'User';
      },

      isBusinessOwner: () => {
        const user = get().user;
        // Check for both BusinessOwner and Manager (consolidated roles)
        return user?.role === 'Agent';
      },

      isStaff: () => {
        const user = get().user;
        // Staff if not BusinessOwner and not Manager (both treated as business-owner)
        const isOwner = user?.role === 'Agent';
        return !isOwner;
      },

      getAccountType: () => {
        const user = get().user;
        //return 'CORP'
        return user?.role || null;
      },

      isBusinessAccount: () => {
        const user = get().user;
        return user?.role === 'Agent';
      },

      // ============ ACTIONS ============

      login: async (userData, token, refreshToken) => {
        const timestamp = new Date().toISOString();

        set({
          user: userData,
          token,
          refreshToken,
          isAuthenticated: true,
          lastLoginTimestamp: timestamp,
        });

        // Also store token separately for API interceptor
        await setAuthToken(token);

        // ✅ Invalidate ALL queries to refetch with new auth token
        // This ensures fresh data for all authenticated endpoints
        queryClient.invalidateQueries();

        console.log('✅ AUTH STORE: User logged in - all queries invalidated', {
          user: userData.email,
          customerId: get().getCustomerId(),
          role: get().getUserRole(),
        });
      },

      logout: async () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          lastLoginTimestamp: null,
          lastActivityTimestamp: null,
        });

        // Clear token from localStorage for API interceptor
        await removeAuthToken();
        await removeFromStorage('user-data');

        // Clear all cached queries on logout
        queryClient.clear();

        console.log('👋 AUTH STORE: User logged out');
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));

        console.log('🔄 AUTH STORE: User data updated', userData);
      },

      updateToken: async (token, refreshToken) => {
        set((state) => ({
          token,
          refreshToken: refreshToken || state.refreshToken,
        }));

        // Update token in SecureStorage for API interceptor
        await setAuthToken(token);

        console.log('🔐 AUTH STORE: Token updated');
      },

      updateLastActivity: () => {
        const timestamp = new Date().toISOString();
        set({ lastActivityTimestamp: timestamp });
      },

      isSessionValid: () => {
        const { isAuthenticated, lastLoginTimestamp } = get();

        if (!isAuthenticated || !lastLoginTimestamp) {
          return false;
        }

        // Check if session is less than 24 hours old
        const lastLogin = new Date(lastLoginTimestamp).getTime();
        const now = Date.now();
        const maxSessionTime = 24 * 60 * 60 * 1000; // 24 hours

        return (now - lastLogin) < maxSessionTime;
      },
    }),
      {
        name: 'auth-storage',
        version: 2,
        storage: secureStorageAdapter as any, // 🔐 Use SecureStorage instead of localStorage
        // State migration to transform Manager role to BusinessOwner
        migrate: (persistedState: any, version: number) => {
          if (version < 2 && persistedState?.user) {
            // Transform cached Manager role to BusinessOwner
            if (persistedState.user.role === 'Manager') {
              console.log('🔄 Migrating cached Manager role to BusinessOwner');
              persistedState.user.role = 'BusinessOwner';
            }
            if (persistedState.user.userType === 'Manager') {
              persistedState.user.userType = 'BusinessOwner';
            }
          }
          return persistedState;
        },
        // Only persist essential data
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
          lastLoginTimestamp: state.lastLoginTimestamp,
          lastActivityTimestamp: state.lastActivityTimestamp,
        }),
      }
    )
  )
);

// ==============================================
// UTILITY SELECTORS (for better performance)
// ==============================================

/**
 * Selector hooks for optimized re-renders
 * Use these to subscribe to specific parts of the store
 */

export const useUser = () => useAuthStore((state) => state.user);
export const useToken = () => useAuthStore((state) => state.token);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useCustomerId = () => useAuthStore((state) => state.getCustomerId());
export const useUserRole = () => useAuthStore((state) => state.getUserRole());
export const useIsBusinessOwner = () => useAuthStore((state) => state.isBusinessOwner());
export const useIsStaff = () => useAuthStore((state) => state.isStaff());
// export const useBusinessId = () => useAuthStore((state) => state.user?.businessId || null);
export const useAccountType = () => useAuthStore((state) => state.getAccountType());
export const useIsBusinessAccount = () => useAuthStore((state) => state.isBusinessAccount());
