import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiClient, onboardingApiClient } from '../config';
import type {
  LoginRequest,
  LoginResponse,
  LoginApiResponseData,
  RegisterUserRequest,
  ApiResponse,
  ValidateOTPForgotPasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  GenerateOTPByUsernameApiResponse,
  ValidateOTPForgotPasswordApiResponse,
  ForgotPasswordApiResponse,
  ResetPasswordApiResponse,
} from "../../types/api.types";
import apiClient from "../../api/apiClient";


// Auth-specific response wrapper types
type LoginApiResponse = ApiResponse<LoginApiResponseData>;
type RegisterApiResponse = ApiResponse<LoginApiResponseData>;

// ==============================================
// Mutation Functions
// ==============================================

/**
 * Login user
 * @endpoint POST /Login
 */
export const loginUser = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginApiResponse>(
    "/Authentication/Login",
    credentials,
  );
  console.log("🔐 LOGIN RESPONSE:", JSON.stringify(response, null, 2));

  // SECURITY FIX: CWE-117 - Sanitize API response before logging
  //   console.log('🔐 LOGIN RESPONSE:', sanitizeForLog(JSON.stringify(response, null, 2)));

  // Handle the wrapped response structure
  if (response.data.statusCode !== 200) {
    window.location.reload();
  }
  // if (!response.data) {
  //   console.error('❌ No response.data');
  // }

  const apiData = response.data.data;

  // Check for responseCode "01" (device ID change requiring OTP verification)
  // if(response.data.status?.toLowerCase() !== 'success' && apiData?.responseCode === '01') {
  //   // Return special response indicating OTP is required
  //   return {
  //     success: false,
  //     message: response.data.message || 'Device verification required',
  //     otpRequired: true,
  //     responseCode: '01',
  //     user: {
  //       id: String(apiData?.id || 0),
  //       name: apiData?.fullName || apiData?.userName || '',
  //       username: apiData?.userName || '',
  //       email: apiData?.email || '',
  //       role: (apiData?.role || apiData?.userType || 'Staff') as "Staff" | "Manager" | "BusinessOwner",
  //       position: (apiData?.role === 'BusinessOwner' ? 'Business Owner' : apiData?.role === 'Manager' ? 'Manager' : 'Staff'),
  //       department: (apiData?.role === 'BusinessOwner' ? 'Management' : 'Operations'),
  //       employeeId: apiData?.customerId || String(apiData?.id || 0),
  //       customerId: apiData?.customerId || undefined,
  //       businessId: apiData?.businessId || undefined,
  //       phone: apiData?.phone || undefined,
  //       userType: apiData?.userType || undefined,
  //       status: apiData?.status || undefined,
  //       storedId: apiData?.storedId || null,
  //       accountType: apiData?.accountType || null,
  //       permissions: {
  //         acceptPayments: true,
  //         viewReports: true,
  //         manageInventory: (apiData?.role === 'BusinessOwner' || apiData?.role === 'Manager'),
  //         processOrders: true,
  //         manageStaff: (apiData?.role === 'BusinessOwner' || apiData?.role === 'Manager'),
  //         viewAnalytics: (apiData?.role === 'BusinessOwner' || apiData?.role === 'Manager'),
  //         exportData: (apiData?.role === 'BusinessOwner' || apiData?.role === 'Manager'),
  //       }
  //     },
  //     token: '',
  //     refreshToken: '',
  //     inAppToken: '',
  //     expiresIn: 0,
  //   };
  // }

  if (!response.data.data.token || !response.data.data.user) {
    const message = response?.data?.message || "Unable to login.";
    throw new Error(message);
  }

  // if (!response.data.data) {
  //   console.error('❌ No response.data.data. Full response:', response.data);
  //   throw new Error(`Invalid login response structure. Response`);
  // }

  // SECURITY FIX: CWE-117 - Sanitize API data before logging
  //   console.log('✅ API Data:', sanitizeForLog(JSON.stringify(apiData)));

  // Preserve API format (PascalCase) for role/userType
  // API returns: "BusinessOwner", "Manager", or "Staff"
  // Auth store expects the same PascalCase format
  // const roleFromApi = apiData.user.userType as "User" | "Agent";
  // SECURITY FIX: CWE-117 - Sanitize role data before logging
  //   console.log('🔍 Role from API (preserved):', sanitizeForLog(roleFromApi));

  // Normalize to proper PascalCase in case API returns variations
  // const normalizedRole: "User" | "Agent" | "" =
  //   roleFromApi === "User"
  //     ? "User"
  //     : roleFromApi === "Agent"
  //     ? "Agent"
  //     : ""; // Default to Staff

  // SECURITY FIX: CWE-117 - Sanitize normalized role before logging
  //   console.log('🔍 Normalized role:', sanitizeForLog(normalizedRole));

  const transformedResponse: LoginResponse = {
    //     success: boolean;
    // message: string;
    // statusCode: number;
    // token: string;
    // refreshToken: string;
    // profileComplete: boolean;
    // user: {
    // id: string;
    // email: string;
    // profilePhoto: string;
    // role: "Agent" | "User";
    // status: string;
    // createdAt: string;
    // updatedAt: string;
    // lastLoginAt: string;
    // };
    success: response.data.success,
    message: response.data.message || "",
    statusCode: response.data.statusCode,
    token: response.data.data.token,
    refreshToken: response.data.data.refreshToken,
    // profileComplete: false,
    user: {
      id: apiData.user.id,
      email: apiData.user.email,
      firstName: apiData.user.firstName,
      lastName: apiData.user.lastName,
      fullName: apiData.user.fullName,
      phoneNumber: apiData.user.phoneNumber,
      profilePhoto: apiData.user.profilePhoto,
      role: apiData.user.role,
      status: apiData.user.status,
      createdAt: apiData.user.createdAt,
      updatedAt: apiData.user.updatedAt,
      lastLoginAt: apiData.user.lastLoginAt,
      profileCompleted: apiData.user.profileCompleted,
      profileCompletedAt: apiData.user.profileCompletedAt,
    },
  };

  // SECURITY FIX: CWE-117 - Sanitize transformed response before logging
  //   console.log('✅ TRANSFORMED RESPONSE:', sanitizeForLog(JSON.stringify(transformedResponse)));

  return transformedResponse;
};

/**
 * Register new user
 * @endpoint POST /Register
 */
export const registerUser = async (
  userData: RegisterUserRequest,
): Promise<LoginResponse> => {
  const response = await apiClient.post<RegisterApiResponse>(
    "/Register",
    userData,
  );
  console.log("🔐 Register RESPONSE:", JSON.stringify(response, null, 2));

  // Handle the wrapped response structure
  // if (response.data.data) {
  //   const apiData = response.data.data;

  //   // Preserve API format (PascalCase) for role/userType (same as login)
  //   const roleFromApi = (apiData.role || apiData.userType || 'Staff') as "Staff" | "Manager" | "BusinessOwner";

  //   // Normalize to proper PascalCase in case API returns variations
  //   const normalizedRole: "Staff" | "Manager" | "BusinessOwner" =
  //     roleFromApi === 'BusinessOwner' ? 'BusinessOwner' :
  //     roleFromApi === 'Manager' ? 'Manager' :
  //     'Staff'; // Default to Staff

  //   const transformedResponse: LoginResponse = {
  //     success: response.data.status === 'success',
  //     message: response.data.message || 'Registration successful',
  //     passwordUpdateRequired: apiData.passwordUpdateRequired,
  //     user: {
  //       id: String(apiData.id || 0),
  //       username: apiData.userName || '',
  //       name: apiData.fullName || apiData.userName || 'User',
  //       email: apiData.email || '',
  //       role: normalizedRole, // PascalCase format matching auth store expectations
  //       position: normalizedRole === 'BusinessOwner' ? 'Business Owner' : normalizedRole === 'Manager' ? 'Manager' : 'Staff',
  //       department: normalizedRole === 'BusinessOwner' ? 'Management' : 'Operations',
  //       employeeId: apiData.customerId || String(apiData.id || 0),
  //       customerId: apiData.customerId || undefined,
  //       businessId: apiData.businessId || undefined,
  //       phone: apiData.phone || undefined,
  //       userType: apiData.userType || undefined, // Preserve original API value
  //       status: apiData.status || undefined,
  //       accountType: apiData.accountType || null,
  //       permissions: {
  //         acceptPayments: true,
  //         viewReports: true,
  //         manageInventory: normalizedRole === 'BusinessOwner' || normalizedRole === 'Manager',
  //         processOrders: true,
  //         manageStaff: normalizedRole === 'BusinessOwner' || normalizedRole === 'Manager',
  //         viewAnalytics: normalizedRole === 'BusinessOwner' || normalizedRole === 'Manager',
  //         exportData: normalizedRole === 'BusinessOwner' || normalizedRole === 'Manager',
  //       }
  //     },
  //     // Use the real JWT token from API response
  //     token: apiData.token,
  //     refreshToken: apiData.token, // API doesn't provide separate refresh token yet
  //     inAppToken: apiData.inAppToken || '', // In-app token for additional authorization
  //     expiresIn: 3600, // 1 hour (default since API doesn't specify)
  //   };

  //   return transformedResponse;
  // }

  // // Handle successful registration with minimal data
  // // API returns: {"status":"success","message":"user created","data":"","errors":null}
  // if (response.data.status === 'success') {
  //   // Return minimal successful response to prevent error toast
  //   const transformedResponse: LoginResponse = {
  //     success: true,
  //     message: response.data.message || 'Registration successful',
  //     passwordUpdateRequired: false,
  //     user: {
  //       id: '0',
  //       name: 'User',
  //       username: '',
  //       email: '',
  //       role: 'BusinessOwner',
  //       position: 'Business Owner',
  //       department: 'Management',
  //       employeeId: '0',
  //       permissions: {
  //         acceptPayments: true,
  //         viewReports: true,
  //         manageInventory: true,
  //         processOrders: true,
  //         manageStaff: true,
  //         viewAnalytics: true,
  //         exportData: true,
  //       }
  //     },
  //     token: '',
  //     refreshToken: '',
  //     inAppToken: '',
  //     expiresIn: 3600,
  //   };
  //   return transformedResponse;
  // }

  throw new Error("Invalid registration response structure");
};

/**
 * Generate OTP for forgot password flow
 * @endpoint POST /GenerateOTPByUsername?username={username}
 * @returns recipientId (string) to be used in ValidateOTP
 */
export const generateOTPByUsername = async (
  username: string,
): Promise<string> => {
  // console.log('📱 [FORGOT PASSWORD] Generating OTP for username:', sanitizeForLog(username));

  const response =
    await apiClient.post<GenerateOTPByUsernameApiResponse>(
      `/GenerateOTPByUsername?username=${encodeURIComponent(username)}`,
    );

  //   console.log('✅ [FORGOT PASSWORD] OTP generation response:', sanitizeForLog(JSON.stringify(response.data)));

  //   if (response.data.status?.toLowerCase() !== 'success') {
  //     const message = response.data.message || 'Failed to generate OTP. Please try again.';
  //     throw new Error(message);
  //   }

  //   // NOTE: API returns a recipientId string, but for the forgot password flow,
  //   // the ValidateOTP endpoint expects the recipientId to be the username itself.
  //   // We return this value for API compatibility but it's not used in the UI flow.
  //   const recipientId = response.data.data;

  // //   console.log('✅ [FORGOT PASSWORD] OTP sent successfully');
  //   return recipientId;
  return response.status.toString();
};

/**
 * Validate OTP for forgot password flow
 * @endpoint POST /ValidateOTP
 * @param data.otp - The 6-digit OTP code
 * @param data.recipientId - Should be the username (not the recipientId from GenerateOTPByUsername)
 * @returns boolean indicating if OTP is valid
 */
export const validateOTPForgotPassword = async (
  data: ValidateOTPForgotPasswordRequest,
): Promise<boolean> => {
  // console.log('🔐 [FORGOT PASSWORD] Validating OTP for recipientId:', sanitizeForLog(data.recipientId));

  const response =
    await apiClient.post<ValidateOTPForgotPasswordApiResponse>(
      "/ValidateOTP",
      data,
    );

  // console.log('✅ [FORGOT PASSWORD] OTP validation response:', sanitizeForLog(JSON.stringify(response.data)));

  // if (response.data.status?.toLowerCase() !== "success") {
  //   const message = response.data.message || "Invalid OTP. Please try again.";
  //   throw new Error(message);
  // }

  // const isValid = response.data.data;

  // if (!isValid) {
  //   throw new Error("Invalid OTP code. Please check and try again.");
  // }

  //   console.log('✅ [FORGOT PASSWORD] OTP validated successfully');
  return false;
};

/**
 * Complete forgot password flow
 * @endpoint POST /ForgotPassword
 * @returns LoginResponse with user data and tokens (auto-login)
 */
export const forgotPassword = async (
  data: ForgotPasswordRequest,
): Promise<LoginResponse> => {
  //   console.log('🔑 [FORGOT PASSWORD] Completing password reset for username:', sanitizeForLog(data.username || ''));

  const response =
    await apiClient.post<ForgotPasswordApiResponse>(
      "/ForgotPassword",
      data,
    );

  //   console.log('✅ [FORGOT PASSWORD] Password reset response:', sanitizeForLog(JSON.stringify(response.data)));

  // if (response.data.status?.toLowerCase() !== "success") {
  //   const message =
  //     response.data.message || "Failed to reset password. Please try again.";
  //   throw new Error(message);
  // }

  // const apiData = response.data.data;

  // if (!apiData) {
  //   throw new Error("Invalid password reset response structure");
  // }

  // // Transform to same format as login (reuse login transformation logic)
  // const roleFromApi = (apiData.role || apiData.userType || "Staff") as
  //   | "Staff"
  //   | "Manager"
  //   | "BusinessOwner";
  // const normalizedRole: "Staff" | "Manager" | "BusinessOwner" =
  //   roleFromApi === "BusinessOwner"
  //     ? "BusinessOwner"
  //     : roleFromApi === "Manager"
  //     ? "Manager"
  //     : "Staff";

  // const transformedResponse: LoginResponse = {
  //   success: response.data.status === "success",
  //   message: response.data.message || "Password reset successful",
  //   passwordUpdateRequired: apiData.passwordUpdateRequired,
  //   pinSetupRequired: apiData.pinSetupRequired,
  //   user: {
  //     id: String(apiData.id || 0),
  //     username: apiData.userName || "",
  //     name: apiData.fullName || apiData.userName || "User",
  //     email: apiData.email || "",
  //     role: normalizedRole,
  //     position:
  //       normalizedRole === "BusinessOwner"
  //         ? "Business Owner"
  //         : normalizedRole === "Manager"
  //         ? "Manager"
  //         : "Staff",
  //     department:
  //       normalizedRole === "BusinessOwner" ? "Management" : "Operations",
  //     employeeId: apiData.customerId || String(apiData.id || 0),
  //     customerId: apiData.customerId || undefined,
  //     businessId: apiData.businessId || undefined,
  //     phone: apiData.phone || undefined,
  //     userType: apiData.userType || undefined,
  //     status: apiData.status || undefined,
  //     accountType: apiData.accountType || null,
  //     permissions: {
  //       acceptPayments: true,
  //       viewReports: true,
  //       manageInventory:
  //         normalizedRole === "BusinessOwner" || normalizedRole === "Manager",
  //       processOrders: true,
  //       manageStaff:
  //         normalizedRole === "BusinessOwner" || normalizedRole === "Manager",
  //       viewAnalytics:
  //         normalizedRole === "BusinessOwner" || normalizedRole === "Manager",
  //       exportData:
  //         normalizedRole === "BusinessOwner" || normalizedRole === "Manager",
  //     },
  //   },
  //   token: apiData.token || "",
  //   refreshToken: apiData.token || "",
  //   inAppToken: apiData.inAppToken || "",
  //   expiresIn: 3600,
  // };

  //   console.log('✅ [FORGOT PASSWORD] Transformed response:', sanitizeForLog(JSON.stringify(transformedResponse)));
  return response as any;
};

/**
 * Reset password (when user knows current password)
 * @endpoint POST /ResetPassword
 * @returns LoginResponse with user data and tokens
 */
export const resetPassword = async (
  data: ResetPasswordRequest,
): Promise<LoginResponse> => {
  //   console.log('🔑 [RESET PASSWORD] Resetting password for user:', sanitizeForLog(data.username));

  const response =
    await apiClient.post<ResetPasswordApiResponse>(
      "/ResetPassword",
      data,
    );

  //   console.log('✅ [RESET PASSWORD] Response:', sanitizeForLog(JSON.stringify(response.data)));

  // if (response.data.status?.toLowerCase() !== "success") {
  //   const message =
  //     response.data.message ||
  //     "Failed to reset password. Please check your current password.";
  //   throw new Error(message);
  // }

  // const apiData = response.data.data;

  // if (!apiData) {
  //   throw new Error("Invalid reset password response structure");
  // }

  // // Transform to same format as login
  // const roleFromApi = (apiData.role || apiData.userType || "Staff") as
  //   | "Staff"
  //   | "Manager"
  //   | "BusinessOwner";
  // const normalizedRole: "Staff" | "Manager" | "BusinessOwner" =
  //   roleFromApi === "BusinessOwner"
  //     ? "BusinessOwner"
  //     : roleFromApi === "Manager"
  //     ? "Manager"
  //     : "Staff";

  // const transformedResponse: LoginResponse = {
  //   success: response.data.status === "success",
  //   message: response.data.message || "Password reset successful",
  //   passwordUpdateRequired: apiData.passwordUpdateRequired,
  //   pinSetupRequired: apiData.pinSetupRequired,
  //   user: {
  //     id: String(apiData.id || 0),
  //     username: apiData.userName || "",
  //     name: apiData.fullName || apiData.userName || "User",
  //     email: apiData.email || "",
  //     role: normalizedRole,
  //     position:
  //       normalizedRole === "BusinessOwner"
  //         ? "Business Owner"
  //         : normalizedRole === "Manager"
  //         ? "Manager"
  //         : "Staff",
  //     department:
  //       normalizedRole === "BusinessOwner" ? "Management" : "Operations",
  //     employeeId: apiData.customerId || String(apiData.id || 0),
  //     customerId: apiData.customerId || undefined,
  //     businessId: apiData.businessId || undefined,
  //     phone: apiData.phone || undefined,
  //     userType: apiData.userType || undefined,
  //     status: apiData.status || undefined,
  //     accountType: apiData.accountType || null,
  //     permissions: {
  //       acceptPayments: true,
  //       viewReports: true,
  //       manageInventory:
  //         normalizedRole === "BusinessOwner" || normalizedRole === "Manager",
  //       processOrders: true,
  //       manageStaff:
  //         normalizedRole === "BusinessOwner" || normalizedRole === "Manager",
  //       viewAnalytics:
  //         normalizedRole === "BusinessOwner" || normalizedRole === "Manager",
  //       exportData:
  //         normalizedRole === "BusinessOwner" || normalizedRole === "Manager",
  //     },
  //   },
  //   token: apiData.token || "",
  //   refreshToken: apiData.token || "",
  //   inAppToken: apiData.inAppToken || "",
  //   expiresIn: 3600,
  // };

  //   console.log('✅ [RESET PASSWORD] Transformed response:', sanitizeForLog(JSON.stringify(transformedResponse)));
  return response as any;
};

// ==============================================
// React Query Mutation Hooks
// ==============================================

/**
 * Hook for user login
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: loginUser,
    retry: 3, // Retry failed login attempts up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s
    onSuccess: () => {
      // Invalidate staff queries (use partial key to invalidate all staff queries)
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

/**
 * Hook for user registration
 */
export const useRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, RegisterUserRequest>({
    mutationFn: registerUser,
    onSuccess: () => {
      // Invalidate staff queries after successful registration
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

/**
 * Hook for generating OTP in forgot password flow
 */
export const useGenerateOTPByUsernameMutation = () => {
  return useMutation<string, Error, string>({
    mutationFn: generateOTPByUsername,
  });
};

/**
 * Hook for validating OTP in forgot password flow
 */
export const useValidateOTPForgotPasswordMutation = () => {
  return useMutation<boolean, Error, ValidateOTPForgotPasswordRequest>({
    mutationFn: validateOTPForgotPassword,
  });
};

/**
 * Hook for forgot password (complete password reset with OTP)
 */
export const useForgotPasswordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, ForgotPasswordRequest>({
    mutationFn: forgotPassword,
    onSuccess: () => {
      // Invalidate staff queries after successful password reset
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

/**
 * Hook for reset password (when user knows current password)
 */
export const useResetPasswordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, ResetPasswordRequest>({
    mutationFn: resetPassword,
    onSuccess: () => {
      // Invalidate staff queries after successful password reset
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};
