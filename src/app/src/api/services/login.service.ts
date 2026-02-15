import { toast } from "sonner";
import secureStorage, { setUsername, setInAppToken, setAuthToken, setSelectedAccountId, getSelectedAccountId, removeFromStorage } from "../../stores/storage";
import { useAuthStore } from "../../stores/useAuthStore";
import type { LoginRequest, LoginResponse } from "../../types/api.types";
import { getDeviceId } from "../../utils/deviceId";
import { generateOTPByUsername, loginUser } from "../../hooks/auth/useAuthMutations";
import { fetchStoreById } from "../../hooks/business/useStoresQueries";
import { isTechnicalMessage } from "../../utils/errorMessageFormatter";



/**
 * Retry login with OTP after device verification
 */
export const handleLoginWithOTP = async (
  formData: {
    username: string;
    password: string;
    cachedUsername: string;
    isReturningUser: boolean;
  },
  otp: string,
  onLogin: (credentials: {
    identifier: string;
    password: string;
    isReturningUser?: boolean;
  }) => void,
  setIsLoading: (loading: boolean) => void,
  biometricAuth?: {
    storePasswordSecurely: (
      username: string,
      password: string,
    ) => Promise<boolean>;
  },
  onPasswordChangeRequired?: (response: any) => void,
  onPinSetupRequired?: (response: any) => void,
) => {
  const finalUsername = formData.isReturningUser
    ? formData.cachedUsername
    : formData.username;

  setIsLoading(true);

  try {
    // Get device ID for login
    const deviceId = await getDeviceId();

    // Prepare login request payload with OTP
    const loginRequest: LoginRequest = {
      // username: finalUsername,
      email: finalUsername,
      password: formData.password,
      deviceId: deviceId,
      // otp: otp,
    };

    // Execute the API call with OTP
    const response: LoginResponse = await loginUser(loginRequest);
    const apiUser = response.user as any;

    // ✅ UPDATE ZUSTAND STORE FIRST - before any redirects
    const zustandUser = {
      id: apiUser.id,
      userName: apiUser.username || finalUsername,
      fullName: apiUser.name || finalUsername,
      businessId: apiUser.businessId || null,
      phone: apiUser.phone || "",
      email: apiUser.email || "",
      customerId: apiUser.customerId || null,
      userType:
        apiUser.userType ||
        (apiUser.role === "BusinessOwner" ? "BusinessOwner" : "Staff"),
      status: apiUser.status || "Active",
      role:
        apiUser.role,
      storeId: apiUser.storedId || null,
      profilePhoto: apiUser.profilePhoto || null,
      createdAt: apiUser.createdAt || null,
      updatedAt: apiUser.updatedAt || null,
      lastLoginAt: apiUser.lastLoginAt || null,
    };

    const { login } = useAuthStore.getState();
    login(zustandUser, response.token, response.refreshToken);

    // Store tokens separately for API interceptor
    await setAuthToken(response.token);
    // await setInAppToken(response.inAppToken);

    // 🏪 FETCH STORE DETAILS FOR STAFF (if storedId present)
    if (apiUser.storedId && zustandUser.role === "Staff") {
      try {
        // const { fetchStoreById } = await import(
        //   "../../api/business/useStoresQueries"
        // );
        const storeDetails = await fetchStoreById(apiUser.storedId);

        if (storeDetails?.storeAccountNumber) {
        //   const { setSelectedAccountId } = await import("../../storage");
          setSelectedAccountId(storeDetails.storeAccountNumber);
        }
      } catch (error) {
        // Don't block login on store fetch failure
      }
    }

    // 🔒 CHECK FOR PASSWORD CHANGE REQUIREMENT
    // if (response.passwordUpdateRequired === true) {
    //   setIsLoading(false);
    //   onPasswordChangeRequired?.({
    //     ...response,
    //     currentPassword: formData.password,
    //   });
    //   return;
    // }

    // // 🔒 CHECK FOR PIN SETUP REQUIREMENT
    // if (response.pinSetupRequired === true) {
    //   setIsLoading(false);
    //   onPinSetupRequired?.(response);
    //   return;
    // }

    // Keep username cache for returning user detection
    await setUsername(finalUsername);

    // Store password securely for biometric authentication
    if (biometricAuth?.storePasswordSecurely) {
      try {
        await biometricAuth.storePasswordSecurely(
          finalUsername,
          formData.password,
        );
      } catch (error) {
        // Don't block login on password storage failure
      }
    }

    toast.success("Login Successful", {
      description: `Welcome ${formData.isReturningUser ? "back" : ""}, ${
        apiUser.fullName || finalUsername || "User"
      }!`,
    });

    // Pass along user data and credentials to parent component
    onLogin({
      identifier: finalUsername,
      password: formData.password,
      isReturningUser: formData.isReturningUser,
    });
  } catch (error) {
    setIsLoading(false);

    let errorMessage = "Please check your credentials and try again";

    // Extract error message from error object
    // Check for error.data first (API error message), then error.message
    const apiError = error as any;
    const errorData = apiError?.data || apiError?.response?.data;
    const errorStatus = apiError?.status || apiError?.response?.status;
    const errorMsg = apiError?.message || "";

    // Import the isTechnicalMessage helper
    // const { isTechnicalMessage } = await import(
    //   "../../../utils/errorMessageFormatter"
    // );

    // Check HTTP status first
    if (errorStatus === 500 || errorStatus === 502 || errorStatus === 503) {
      errorMessage = "Something went wrong. Please try again later";
    } else if (errorData && typeof errorData === "string") {
      errorMessage = isTechnicalMessage(errorData)
        ? "Something went wrong. Please try again later"
        : errorData;
    } else if (errorData?.message && typeof errorData.message === "string") {
      errorMessage = isTechnicalMessage(errorData.message)
        ? "Something went wrong. Please try again later"
        : errorData.message;
    } else if (errorData?.data && typeof errorData.data === "string") {
      errorMessage = isTechnicalMessage(errorData.data)
        ? "Something went wrong. Please try again later"
        : errorData.data;
    } else if (error instanceof Error) {
      if (
        errorStatus === 401 ||
        errorMsg.includes("401") ||
        errorMsg.includes("unauthorized")
      ) {
        errorMessage = errorData || "Invalid OTP or credentials";
      } else if (errorStatus === 400 || errorMsg.includes("400")) {
        errorMessage = errorData || "Invalid OTP or credentials";
      } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
        errorMessage = "Network error. Please try again";
      } else {
        errorMessage =
          errorData ||
          errorMsg ||
          "Please check your credentials and try again";
      }
    }

    // Re-throw the error so it can be handled by the caller (to navigate back to login screen)
    throw new Error(errorMessage);
  }
};

export const handleLoginSubmit = async (
  formData: {
    username: string;
    password: string;
    cachedUsername: string;
    isReturningUser: boolean;
  },
  onLogin: (credentials: {
    identifier: string;
    password: string;
    isReturningUser?: boolean;
  }) => void,
  setIsLoading: (loading: boolean) => void,
  biometricAuth?: {
    storePasswordSecurely: (
      username: string,
      password: string,
    ) => Promise<boolean>;
  },
  onPasswordChangeRequired?: (response: any) => void,
  onPinSetupRequired?: (response: any) => void,
  onOTPRequired?: (data: {
    username: string;
    phoneNumber?: string;
    credentials: {
      username: string;
      password: string;
      cachedUsername: string;
      isReturningUser: boolean;
    };
  }) => void,
) => {
  // console.log('🔥 API Override: handleLoginSubmit called with:', formData);
  const finalUsername = formData.isReturningUser
    ? formData.cachedUsername
    : formData.username;

  // Enhanced validation for production
  if (!finalUsername.trim() || !formData.password.trim()) {
    toast.error("Validation Error", {
      description: "Please fill in all required fields",
    });
    return;
  }

  if (finalUsername.length < 3) {
    toast.error("Validation Error", {
      description: "Username must be at least 3 characters long",
    });
    return;
  }

  if (formData.password.length < 8) {
    toast.error("Validation Error", {
      description: "Password must be at least 8 characters long",
    });
    return;
  }

  setIsLoading(true);

  try {
    // Get device ID for login
    const deviceId = await getDeviceId();

    // Prepare login request payload
    const loginRequest: LoginRequest = {
      // username: finalUsername,
      email: finalUsername,
      password: formData.password,
      deviceId: deviceId,
    };

    // Execute the API call directly
    const response: LoginResponse = await loginUser(loginRequest);

    console.log('APIIII', response)

    // 🔐 CHECK FOR OTP REQUIREMENT (device ID change - responseCode "01")
    // if (response.otpRequired === true && response.responseCode === "01") {
    //   setIsLoading(false);

    //   try {
    //     // Automatically generate OTP for the username
    //     await generateOTPByUsername(finalUsername);

    //     // Trigger OTP required callback with username, phone number, and credentials for retry
    //     onOTPRequired?.({
    //       username: finalUsername,
    //       phoneNumber: response.user?.phone || undefined,
    //       credentials: {
    //         username: formData.username,
    //         password: formData.password,
    //         cachedUsername: formData.cachedUsername,
    //         isReturningUser: formData.isReturningUser,
    //       },
    //     });

    //     return;
    //   } catch (otpError) {
    //     toast.error("OTP Generation Failed", {
    //       description:
    //         otpError instanceof Error
    //           ? otpError.message
    //           : "Failed to generate OTP. Please try again.",
    //     });
    //     setIsLoading(false);
    //     return;
    //   }
    // }

    // Type assertion for actual API response structure
    const apiUser = response.user as any;

    // 🔍 DIAGNOSTIC LOGGING - Check what we received
    // console.log('🔍 [LOGIN] Response received:', {
    //   storedId: apiUser.storedId,
    //   role: apiUser.role,
    //   hasStoredId: !!apiUser.storedId,
    //   isStaff: apiUser.role === 'Staff'
    // });

    // ✅ UPDATE ZUSTAND STORE FIRST - before any redirects
    // Transform LoginResponse.user to match Zustand User interface
    const zustandUser = {
      id: apiUser.id,
      userName: apiUser.username || finalUsername, // Use username from LoginResponse, fallback to form username
      fullName: apiUser.name || finalUsername, // Use name (full name) from LoginResponse, fallback to username
      businessId: apiUser.businessId || null,
      phone: apiUser.phone || "", // Fallback to empty string if undefined
      email: apiUser.email || "",
      customerId: apiUser.customerId || null, // Convert undefined to null
      userType:
        apiUser.userType ||
        (apiUser.role === "BusinessOwner" ? "BusinessOwner" : "Staff"),
      status: apiUser.status || "Active",
      role:
        apiUser.role,
      storeId: apiUser.storedId || null, // Store ID for staff members (from API field 'storedId')
      accountType: apiUser.accountType || null, // Account type (e.g., "CORP", "IND")
      profilePhoto: apiUser.profilePhoto || null,
      createdAt: apiUser.createdAt || null,
      updatedAt: apiUser.updatedAt || null,
      lastLoginAt: apiUser.lastLoginAt || null,
    };

    const { login } = useAuthStore.getState();
    login(zustandUser, response.token, response.refreshToken);

    // Store tokens separately for API interceptor
    await setAuthToken(response.token);
    // await setInAppToken(response.inAppToken);

    // 🏪 FETCH STORE DETAILS FOR STAFF (if storedId present)
    // console.log('🔍 [STORE CHECK] About to check store fetch condition:', {
    //   apiUserStoredId: apiUser.storedId,
    //   zustandUserRole: zustandUser.role,
    //   willFetchStore: !!(apiUser.storedId && zustandUser.role === 'Staff')
    // });

    if (apiUser.storedId && zustandUser.role === "Staff") {
      try {
        //         console.log('🏪 [STAFF] Fetching store details for storedId:', apiUser.storedId);
        // const { fetchStoreById } = await import(
        //   "../../api/business/useStoresQueries"
        // );
        const storeDetails = await fetchStoreById(apiUser.storedId);

        // Set store account as default selected account
        if (storeDetails?.storeAccountNumber) {
        //   const { setSelectedAccountId, getSelectedAccountId } = await import(
        //     "../../storage"
        //   );
          setSelectedAccountId(storeDetails.storeAccountNumber);

          // Verify it was saved correctly
          const verifyStoredAccount = getSelectedAccountId();
          //           console.log('✅ [STAFF] Store account set as default:', {
          //             storeId: apiUser.storedId,
          //             accountNumber: storeDetails.storeAccountNumber,
          //             accountName: storeDetails.storeAccountName,
          //             verifiedInStorage: verifyStoredAccount,
          //             savedCorrectly: verifyStoredAccount === storeDetails.storeAccountNumber
          //           });
        } else {
          //           console.warn('⚠️ [STAFF] Store details found but no account number');
        }
      } catch (error) {
        //         console.error('❌ [STAFF] Failed to fetch store details:', error);
        // Don't block login on store fetch failure
      }
    }

    // 🔒 CHECK FOR PASSWORD CHANGE REQUIREMENT (after auth store update)
    // if (response.passwordUpdateRequired === true) {
    //   //       console.log('⚠️ Password update required - redirecting to password change screen');
    //   setIsLoading(false);
    //   onPasswordChangeRequired?.({
    //     ...response,
    //     currentPassword: formData.password, // Pass password from login form
    //   });
    //   return;
    // }

    // // 🔒 CHECK FOR PIN SETUP REQUIREMENT (after auth store update)
    // if (response.pinSetupRequired === true) {
    //   //       console.log('⚠️ PIN setup required - redirecting to PIN setup screen');
    //   setIsLoading(false);
    //   onPinSetupRequired?.(response);
    //   return;
    // }

    //     console.log('✅ ZUSTAND: User stored in auth store:', {
    //       fullName: zustandUser.fullName,
    //       customerId: zustandUser.customerId,
    //       phone: zustandUser.phone,
    //       role: zustandUser.role,
    //       userType: zustandUser.userType
    //     });

    // Keep username cache for returning user detection (still needed for UI)
    await setUsername(finalUsername);

    // Store password securely for biometric authentication (native platforms only)
    if (biometricAuth?.storePasswordSecurely) {
      try {
        const stored = await biometricAuth.storePasswordSecurely(
          finalUsername,
          formData.password,
        );
        if (stored) {
          //           console.log('✅ PASSWORD: Stored securely for biometric auth');
        } else {
          //           console.log('⚠️ PASSWORD: Not stored (biometry unavailable or web platform)');
        }
      } catch (error) {
        //         console.error('❌ PASSWORD: Failed to store for biometric auth:', error);
        // Don't block login on password storage failure
      }
    }

    toast.success("Login Successful", {
      description: `Welcome ${formData.isReturningUser ? "back" : ""}, ${
        apiUser.fullName || finalUsername || "User"
      }!`,
    });

    // Pass along user data and credentials to parent component
    onLogin({
      identifier: finalUsername,
      password: formData.password,
      isReturningUser: formData.isReturningUser,
    });
  } catch (error) {
    //     console.error('[API] Login error:', error);

    // Enhanced error handling
    let errorMessage = "Please check your credentials and try again";
    let shouldFallback = false;

    // Extract error message from error object
    // Check for error.data first (API error message), then error.message
    const apiError = error as any;
    const errorData = apiError?.data || apiError?.response?.data;
    const errorStatus = apiError?.status || apiError?.response?.status;
    const errorMsg = apiError?.message || "";

  
    // Check HTTP status first
    if (errorStatus === 500 || errorStatus === 502 || errorStatus === 503) {
      errorMessage = "Something went wrong. Please try again later";
      shouldFallback = true;
    } else if (errorData && typeof errorData === "string") {
      errorMessage = isTechnicalMessage(errorData)
        ? "Something went wrong. Please try again later"
        : errorData;
    } else if (errorData?.message && typeof errorData.message === "string") {
      errorMessage = isTechnicalMessage(errorData.message)
        ? "Something went wrong. Please try again later"
        : errorData.message;
    } else if (errorData?.data && typeof errorData.data === "string") {
      errorMessage = isTechnicalMessage(errorData.data)
        ? "Something went wrong. Please try again later"
        : errorData.data;
    } else if (error instanceof Error) {
      if (
        errorMsg.includes("network") ||
        errorMsg.includes("fetch") ||
        errorMsg.includes("NetworkError")
      ) {
        errorMessage = "Network error. Falling back to demo mode...";
        shouldFallback = true; // Network errors should trigger fallback
      } else if (
        errorStatus === 401 ||
        errorMsg.includes("401") ||
        errorMsg.includes("unauthorized")
      ) {
        errorMessage = errorData || "Invalid username or password";
      } else if (errorStatus === 400 || errorMsg.includes("400")) {
        errorMessage =
          errorData ||
          "Invalid credentials. Please check your username and password";
      } else if (
        errorStatus === 429 ||
        errorMsg.includes("429") ||
        errorMsg.includes("rate limit")
      ) {
        errorMessage = "Too many login attempts. Please wait and try again";
      } else {
        errorMessage =
          errorData ||
          errorMsg ||
          "Please check your credentials and try again";
      }
    }

    if (shouldFallback) {
      // toast.warning('API Unavailable', {
      //   description: errorMessage
      // });
      // Don't call setIsLoading(false) here - let fallback handle it
      // Re-throw the error to trigger fallback to mock implementation
      throw error;
    } else {
      // For authentication errors, show error but don't fallback
      toast.error("Login Failed", {
        description: errorMessage,
      });
      setIsLoading(false);
    }
  }
};

export const handleUserSwitch = async (resetForm: () => void) => {
  //   console.log('[DEV] Custom user switch triggered');

  // Enhanced cleanup for user switching
  const keysToRemove = [
    "access_business_username",
    "last_login_timestamp",
    "last_biometric_login",
    "user_preferences",
    "cached_business_data",
  ];

  keysToRemove.forEach((key) => {
    removeFromStorage(key);
  });

  // Clear all securely stored passwords (biometric auth credentials)
  try {
    await secureStorage.clearAll();
    //     console.log('✅ USER SWITCH: Secure storage cleared');
  } catch (error) {
    //     console.error('❌ USER SWITCH: Failed to clear secure storage:', error);
    // Don't block user switch on secure storage cleanup failure
  }

  // Reset form state
  resetForm();

  // toast.info('User Switched', {
  //   description: 'Please enter your login credentials'
  // });
};

export const handleBiometricAuthentication = async (
  formData: { cachedUsername: string },
  onLogin: (credentials: {
    identifier: string;
    password: string;
    isReturningUser?: boolean;
  }) => void,
  biometricAuth: {
    isAvailable: boolean;
    authenticate: Function;
    isNative: boolean;
    getStoredPassword: (username: string) => Promise<string | null>;
    removeStoredPassword: (username: string) => Promise<void>;
    storePasswordSecurely?: (
      username: string,
      password: string,
    ) => Promise<boolean>;
  },
  setIsLoading: (loading: boolean) => void,
  setHasTriggeredBiometric: (triggered: boolean) => void,
) => {
  //   console.log('[API] Custom biometric authentication triggered');

  // Enhanced security check
  if (!formData.cachedUsername) {
    toast.error("Authentication Error", {
      description: "No cached user found for biometric authentication",
    });
    setHasTriggeredBiometric(false);
    return;
  }

  // Enhanced native biometric authentication
  if (!biometricAuth.isAvailable) {
    toast.error("Biometric Authentication Unavailable", {
      description: "Please use your password to login",
    });
    setHasTriggeredBiometric(false);
    return;
  }

  setIsLoading(true);
  try {
    const result = await biometricAuth.authenticate(
      `Authenticate to access ${formData.cachedUsername}'s Access SME account`,
    );

    if (result.success) {
      // Retrieve stored password for API authentication
      const storedPassword = await biometricAuth.getStoredPassword(
        formData.cachedUsername,
      );

      if (!storedPassword) {
        // Password not found - prompt user for password to complete biometric setup
        //         console.log('🔐 BIOMETRIC AUTH: No stored password found, prompting user for manual password entry');
        setIsLoading(false);
        setHasTriggeredBiometric(false);

        // Stored credentials expired or not found
        throw new Error(
          "Stored credentials expired or not found. Please login with your password to re-enable biometric authentication.",
        );
      }

      // Get device ID for login
      const deviceId = await getDeviceId();

      // Make REAL API login call with actual password
      const loginRequest: LoginRequest = {
        // username: formData.cachedUsername,
        email: formData.cachedUsername,
        password: storedPassword,
        deviceId: deviceId,
      };

      //       console.log('🔐 BIOMETRIC AUTH: Calling API with stored credentials');
      const response: LoginResponse = await loginUser(loginRequest);
      // Type assertion for actual API response structure
      const apiUser = response.user as any;

      // Update Zustand store with fresh tokens
      const zustandUser = {
        id: apiUser.id,
        userName: formData.cachedUsername,
        fullName: apiUser.name || formData.cachedUsername, // Use apiUser.name (not fullName) to match API response
        // businessId: response.user.businessId || null,
        // phone: response.user.phone || "",
        email: response.user.email || "",
        // customerId: response.user.customerId || null,
        userType: response.user.role,
        status: response.user.status,
        role: response.user.role,
        storeId: apiUser.storedId || null, // Store ID for staff members (from API field 'storedId')
        profilePhoto: apiUser.profilePhoto || null,
        createdAt: apiUser.createdAt || null,
        updatedAt: apiUser.updatedAt || null,
        lastLoginAt: apiUser.lastLoginAt || null,
      };

      const { login } = useAuthStore.getState();
      // API doesn't return refreshToken despite type definition
      login(zustandUser, response.token, "");

      // Store tokens separately for API interceptor
      await setAuthToken(response.token);
      // await setInAppToken(response.inAppToken);

      //       console.log('✅ BIOMETRIC AUTH: Fresh tokens received from API');

      toast.success("Authentication Successful", {
        description: `Welcome back, ${response.user.email}!`,
      });

      // Pass real credentials to parent
      onLogin({
        identifier: formData.cachedUsername,
        password: storedPassword,
        isReturningUser: true,
      });
    } else {
      // Check if user cancelled (don't show toast for user-initiated cancellations)
      const isCancellation =
        result.error?.toLowerCase().includes("cancel") ||
        result.error?.toLowerCase().includes("user") ||
        !result.error;

      if (!isCancellation) {
        toast.error("Authentication Failed", {
          description: result.error || "Please try again or use your password",
        });
      }
      // Reset biometric state on authentication failure or cancellation
      setHasTriggeredBiometric(false);
    }
  } catch (error) {
    //     console.error('[API] Native biometric authentication error:', error);

    // Check if user cancelled (don't show toast for user-initiated cancellations)
    const errorMessage = error instanceof Error ? error.message : "";
    const isCancellation =
      errorMessage.toLowerCase().includes("cancel") ||
      errorMessage.toLowerCase().includes("user");

    // Check for 401 errors (invalid credentials - password may have been changed)
    const is401Error =
      errorMessage.includes("401") ||
      errorMessage.toLowerCase().includes("unauthorized") ||
      errorMessage.toLowerCase().includes("invalid credentials");

    if (is401Error) {
      // Clear stored password as it's no longer valid
      //       console.warn('🔐 BIOMETRIC AUTH: Stored password invalid (401), clearing stored credentials');
      try {
        await biometricAuth.removeStoredPassword(formData.cachedUsername);
      } catch (cleanupError) {
        //         console.error('Failed to remove invalid stored password:', cleanupError);
      }

      toast.error("Credentials Changed", {
        description:
          "Your password has been changed. Please login with your new password.",
      });
    } else if (!isCancellation) {
      toast.error("Authentication Error", {
        description:
          "An unexpected error occurred. Please use your password to login.",
      });
    }
    // Always reset biometric state on any error/cancellation in native auth
    setHasTriggeredBiometric(false);
  } finally {
    setIsLoading(false);
  }
};
