import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
// import {
//   useCustomerAccountsQuery,
//   type CustomerAccount,
// } from "../services/api";
import { useAuthStore } from "../stores/useAuthStore";
// import { fetchStoreById } from "../services/api/business/useStoresQueries";
import { useCustomerAccountsQuery, type CustomerAccount } from "../hooks/onboarding/useOnboardingQueries";
import {
  getSelectedAccountId,
  setSelectedAccountId as setStoredAccountId,
  removeSelectedAccountId,
} from "../stores/storage";
import { fetchStoreById } from "../hooks/business/useStoresQueries";
// import  {useCustomerAccountsQuery, type CustomerAccount } from "../types/api";

// Type alias for backward compatibility
type AccountDetails = CustomerAccount;

/**
 * 🌐 GLOBAL ACCOUNT CONTEXT
 *
 * This context provides site-wide access to user account information fetched from
 * the AccountsByPhoneNumber API. It implements the Reinitialization Pattern to
 * ensure data freshness and proper state management.
 *
 * USE CASES ACROSS THE APPLICATION:
 *
 * 1. USER PROFILE & PERSONALIZATION
 *    - Display user name, email, phone in headers/profile
 *    - Personalized greetings: "Welcome back, {accountName}"
 *    - Pre-fill forms with user contact information
 *
 * 2. FINANCIAL DASHBOARD
 *    - Show total balance across all accounts
 *    - Display account status and health indicators
 *    - Multi-account overview and management
 *
 * 3. ROLE-BASED ACCESS CONTROL
 *    - Use isStaff flag to show/hide features
 *    - Different UI/UX for staff vs business owners
 *    - Permission-based navigation and actions
 *
 * 4. TRANSACTION OPERATIONS
 *    - Pre-fill source account in transfers
 *    - Validate sufficient balance before transactions
 *    - Auto-select primary account for payments
 *
 * 5. KYC/COMPLIANCE
 *    - Display BVN verification status
 *    - Show customer category and tier
 *    - Gate features based on verification level
 *
 * 6. LOCATION SERVICES
 *    - Show assigned branch on maps
 *    - Display branch contact information
 *    - Branch-specific promotions
 *
 * 7. CUSTOMER SUPPORT
 *    - Show account officer details
 *    - Pre-fill support forms with account info
 *    - Quick access to branch information
 */

// ==============================================
// CONTEXT TYPE DEFINITIONS
// ==============================================

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bvn: string;
  customerId: string;
  address: {
    line1: string;
    line2: string;
    line3: string;
    city: string;
    state: string;
    country: string;
  };
}

interface AccountContextValue {
  // Raw Data
  // accounts: AccountDetails[];
  // selectedAccount: AccountDetails | null;
  // primaryAccount: AccountDetails | null;

  // // Derived/Computed Values
  // totalBalance: number;
  // totalAvailableBalance: number;
  // totalBlockedBalance: number;
  // hasMultipleAccounts: boolean;
  // isStaffMember: boolean;
  // userProfile: UserProfile | null;

  // Account Selection
  selectedAccountId: string | null;
  // selectAccount: (accountNumber: string) => void;

  // // State Management
  // isLoading: boolean;
  // error: Error | null;
  // refetch: () => void;

  // // Utility Functions
  // getAccountByNumber: (accountNumber: string) => AccountDetails | undefined;
  // getAccountsByType: (accountType: string) => AccountDetails[];
  // hasActiveAccounts: boolean;
}

// ==============================================
// CONTEXT CREATION
// ==============================================

const AccountContext = createContext<AccountContextValue | undefined>(
  undefined,
);

// ==============================================
// PROVIDER COMPONENT
// ==============================================

interface AccountProviderProps {
  children: React.ReactNode;
  phoneNumber?: string;
  enablePersistence?: boolean;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({
  children,
  phoneNumber,
  enablePersistence = true,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [storeAccount, setStoreAccount] = useState<CustomerAccount | null>(
    null,
  );

  // Get customer ID and store ID from auth store
  const customerId = useAuthStore((state) => state.getCustomerId()) || "";
  const storeId = useAuthStore((state) => state.user?.id) || null;

  // Fetch accounts from API
  // const {
  //   data: customerAccounts = [],
  //   isLoading,
  //   error,
  //   refetch,
  // } = useCustomerAccountsQuery(customerId, {
  //   enabled: !!customerId,
  //   staleTime: 1000 * 60 * 1, // 5 minutes
  // });

  // Merge customer accounts with store account (if exists)
  // const accounts = useMemo(() => {
  //   if (storeAccount) {
  //     return [storeAccount, ...customerAccounts];
  //   }
  //   return customerAccounts;
  // }, [storeAccount, customerAccounts]);

  // Fetch store account for staff members with storeId
  useEffect(() => {
    if (!storeId) {
      setStoreAccount(null);
      return;
    }

    const loadStoreAccount = async () => {
      try {
        // console.log('🏪 [ACCOUNT] Fetching store account for storeId:', storeId);
        // const storeData = await fetchStoreById(Number(storeId));

        // // Transform store data to CustomerAccount format
        // const storeAccountData: CustomerAccount = {
        //   accountNumber: storeData.storeAccountNumber,
        //   accountName: storeData.storeAccountName,
        //   accountType: "STORE_ACCOUNT",
        //   currency: "NGN",
        //   currencyCode: "NGN",
        //   balance: storeData.balance || 0,
        //   availableBalance:
        //     storeData.availableBalance || storeData.balance || 0,
        //   blockedBalance: 0,
        //   customerId: storeData.customerId || customerId,
        //   accountStatus: storeData.isActive ? "ACTIVE" : "INACTIVE",
        //   isStaff: true,
        // };

        // setStoreAccount(storeAccountData);
        // console.log('✅ [ACCOUNT] Store account loaded:', {
        //   accountNumber: storeAccountData.accountNumber,
        //   accountName: storeAccountData.accountName,
        //   balance: storeAccountData.balance
        // });
      } catch (error) {
        // console.error('❌ [ACCOUNT] Failed to fetch store account:', error);
        setStoreAccount(null);
      }
    };

    loadStoreAccount();
  }, [storeId, customerId]);

  // REINITIALIZATION: Load selected account from localStorage on mount
  // useEffect(() => {
  //   if (enablePersistence && !selectedAccountId) {
  //     const savedAccountId = getSelectedAccountId();
  //     if (
  //       savedAccountId &&
  //       accounts.some((acc) => acc.accountNumber === savedAccountId)
  //     ) {
  //       setSelectedAccountId(savedAccountId);
  //     }
  //   }
  // }, [enablePersistence, accounts, selectedAccountId]);

  // REINITIALIZATION: Save selected account to localStorage
  useEffect(() => {
    if (enablePersistence && selectedAccountId) {
      setStoredAccountId(selectedAccountId);
    }
  }, [enablePersistence, selectedAccountId]);

  // REINITIALIZATION: Auto-select account (prioritize stored account for staff)
  // useEffect(() => {
  //   if (accounts.length > 0 && !selectedAccountId) {
  //     // Check if there's a stored account ID from staff login or previous selection
  //     const storedAccountId = getSelectedAccountId();
  //     // console.log('🔍 [ACCOUNT] Auto-select check:', {
  //     //   accountsCount: accounts.length,
  //     //   storedAccountId,
  //     //   accountsInList: accounts.map(a => a.accountNumber)
  //     // });

  //     // If stored account exists, trust it even if not in accounts list (for staff store accounts)
  //     if (storedAccountId) {
  //       setSelectedAccountId(storedAccountId);
  //       // console.log('✅ Using stored account:', storedAccountId);
  //     } else {
  //       // Fallback to first account only if no stored account
  //       setSelectedAccountId(accounts[0].accountNumber);
  //       // console.log('✅ Using first account:', accounts[0].accountNumber);
  //     }
  //   }
  // }, [accounts, selectedAccountId]);

  // REINITIALIZATION: Reset when phone number changes
  useEffect(() => {
    setSelectedAccountId(null);
    if (enablePersistence) {
      removeSelectedAccountId();
    }
  }, [phoneNumber, enablePersistence]);

  // REINITIALIZATION: Clear data on unmount
  useEffect(() => {
    return () => {
      // Cleanup function
    };
  }, []);

  // ==============================================
  // COMPUTED VALUES (MEMOIZED)
  // ==============================================

  // const selectedAccount = useMemo(
  //   () =>
  //     accounts.find((acc) => acc.accountNumber === selectedAccountId) || null,
  //   [accounts, selectedAccountId],
  // );

  // const primaryAccount = useMemo(() => accounts[0] || null, [accounts]);

  // const totalAvailableBalance = useMemo(
  //   () => accounts.reduce((sum, acc) => sum + (acc.availableBalance || 0), 0),
  //   [accounts],
  // );

  // const totalBlockedBalance = useMemo(
  //   () => accounts.reduce((sum, acc) => sum + (acc.blockedBalance || 0), 0),
  //   [accounts],
  // );

  // const totalBalance = useMemo(
  //   () => totalAvailableBalance + totalBlockedBalance,
  //   [totalAvailableBalance, totalBlockedBalance],
  // );

  // const hasMultipleAccounts = useMemo(() => accounts.length > 1, [accounts]);

  // const isStaffMember = useMemo(
  //   () => accounts.some((acc) => acc.isStaff),
  //   [accounts],
  // );

  // const hasActiveAccounts = useMemo(
  //   () =>
  //     accounts.some(
  //       (acc) =>
  //         acc.accountStatus === "REGULAR" || acc.accountStatus === "ACTIVE",
  //     ),
  //   [accounts],
  // );

  // const userProfile = useMemo<UserProfile | null>(() => {
  //   if (!primaryAccount) return null;

  //   return {
  //     name: primaryAccount.accountName,
  //     email: primaryAccount.emailAddress || "",
  //     phone: primaryAccount.phoneNumber || "",
  //     bvn: primaryAccount.bvn || "",
  //     customerId: primaryAccount.customerId || "",
  //     address: {
  //       line1: primaryAccount.strAddress1 || "",
  //       line2: primaryAccount.strAddress2 || "",
  //       line3: primaryAccount.strAddress3 || "",
  //       city: primaryAccount.strCity || "",
  //       state: primaryAccount.strState || "",
  //       country: primaryAccount.country || "",
  //     },
  //   };
  // }, [primaryAccount]);

  // ==============================================
  // UTILITY FUNCTIONS (MEMOIZED)
  // ==============================================

  // const selectAccount = useCallback(
  //   (accountNumber: string) => {
  //     const account = accounts.find(
  //       (acc) => acc.accountNumber === accountNumber,
  //     );
  //     if (account) {
  //       setSelectedAccountId(accountNumber);
  //     }
  //   },
  //   [accounts],
  // );

  // const getAccountByNumber = useCallback(
  //   (accountNumber: string) => {
  //     return accounts.find((acc) => acc.accountNumber === accountNumber);
  //   },
  //   [accounts],
  // );

  // const getAccountsByType = useCallback(
  //   (accountType: string) => {
  //     return accounts.filter(
  //       (acc) => acc.accountType.toLowerCase() === accountType.toLowerCase(),
  //     );
  //   },
  //   [accounts],
  // );

  // ==============================================
  // CONTEXT VALUE
  // ==============================================

  const value: AccountContextValue = {
    // Raw Data
    // accounts,
    // selectedAccount,
    // primaryAccount,

    // // Derived/Computed Values
    // totalBalance,
    // totalAvailableBalance,
    // totalBlockedBalance,
    // hasMultipleAccounts,
    // isStaffMember,
    // userProfile,

    // Account Selection
    selectedAccountId,
    // selectAccount,

    // // State Management
    // isLoading,
    // error: error as Error | null,
    // refetch,

    // // Utility Functions
    // getAccountByNumber,
    // getAccountsByType,
    // hasActiveAccounts,
  };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
};

// ==============================================
// MAIN HOOK
// ==============================================

/**
 * Hook to access account context anywhere in the application
 *
 * @example
 * const { selectedAccount, totalBalance, userProfile } = useAccount();
 */
export const useAccount = () => {
  const context = useContext(AccountContext);
  //console.log("**********************CONTEXT**********************", context)
  if (context === undefined) {
    // Return safe defaults instead of throwing during initialization
    // This handles race conditions during navigation transitions
    // console.warn('⚠️ useAccount called before AccountProvider initialized, returning defaults');
    return {
      accounts: [],
      selectedAccount: null,
      primaryAccount: null,
      totalBalance: 0,
      totalAvailableBalance: 0,
      totalBlockedBalance: 0,
      hasMultipleAccounts: false,
      isStaffMember: false,
      userProfile: null,
      selectedAccountId: null,
      selectAccount: () => {},
      isLoading: true,
      error: null,
      refetch: () => {},
      getAccountByNumber: () => undefined,
      getAccountsByType: () => [],
      hasActiveAccounts: false,
    } as AccountContextValue;
  }
  return context;
};

// ==============================================
// SPECIALIZED UTILITY HOOKS
// ==============================================

/**
 * Hook to access current balance of selected account
 * Useful for payment/transfer screens
 */
// export const useBalance = () => {
//   const { selectedAccount } = useAccount();
//   return {
//     availableBalance: selectedAccount?.availableBalance || 0,
//     blockedBalance: selectedAccount?.blockedBalance || 0,
//     totalBalance:
//       (selectedAccount?.availableBalance || 0) +
//       (selectedAccount?.blockedBalance || 0),
//     currency: selectedAccount?.currency || "NGN",
//     currencyCode: selectedAccount?.currencyCode || "NGN",
//   };
// };

/**
 * Hook to check if user has sufficient balance for a transaction
 */
// export const useBalanceCheck = () => {
//   const { availableBalance } = useBalance();

//   const hasSufficientBalance = useCallback(
//     (amount: number) => {
//       return availableBalance >= amount;
//     },
//     [availableBalance],
//   );

//   const getShortfall = useCallback(
//     (amount: number) => {
//       return Math.max(0, amount - availableBalance);
//     },
//     [availableBalance],
//   );

//   return { hasSufficientBalance, getShortfall, availableBalance };
// };

/**
 * Hook to access user profile information
 * Useful for profile screens and personalization
 */
// export const useProfile = () => {
//   const { userProfile } = useAccount();
//   return userProfile;
// };

/**
 * Hook to check staff status
 * Useful for role-based UI rendering
 */
// export const useIsStaff = () => {
//   const { isStaffMember } = useAccount();
//   return isStaffMember;
// };

/**
 * Hook to access branch information
 * Useful for support and location services
 */
// export const useBranchInfo = () => {
//   const { selectedAccount } = useAccount();

//   if (!selectedAccount) return null;

//   return {
//     branchName: selectedAccount.branchName,
//     branchAddress: selectedAccount.branchAddress,
//     branchCode: selectedAccount.branchCode,
//   };
// };

/**
 * Hook to access account officer information
 * Useful for customer support features
 */
// export const useAccountOfficer = () => {
//   const { selectedAccount } = useAccount();

//   if (!selectedAccount?.accountOfficer) return null;

//   // Parse accountOfficer string: "NAME:ID:PHONE:EMAIL"
//   const parts = selectedAccount.accountOfficer.split(":");

//   return {
//     name: parts[0] || "",
//     id: parts[1] || "",
//     phone: parts[2] || "",
//     email: parts[3] || "",
//     raw: selectedAccount.accountOfficer,
//   };
// };

/**
 * Hook for multi-account operations
 */
// export const useMultiAccount = () => {
//   const { accounts, hasMultipleAccounts, getAccountsByType } = useAccount();

//   const savingsAccounts = useMemo(
//     () => getAccountsByType("SAVING"),
//     [getAccountsByType],
//   );

//   const currentAccounts = useMemo(
//     () => getAccountsByType("CURRENT"),
//     [getAccountsByType],
//   );

//   return {
//     hasMultipleAccounts,
//     allAccounts: accounts,
//     savingsAccounts,
//     currentAccounts,
//     accountCount: accounts.length,
//   };
// };

// ==============================================
// EXPORTS
// ==============================================

export default AccountContext;
