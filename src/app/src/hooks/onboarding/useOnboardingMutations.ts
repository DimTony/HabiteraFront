import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "../../types/api.types";
import apiClient from "../../api/apiClient";

// ==============================================
// Type Definitions
// ==============================================

export interface GenerateOTPRequest {
  bvn: string;
  email: string;
  phone: string;
  fullname: string;
  dob: string; // Format: YYYY-MM-DD
}

export interface GenerateOTPResponse {
  otpId: string;
  message: string;
}

export interface ValidateOTPRequest {
  otpId: string;
  otp: string;
}

export interface AddBusinessRequest {
  agreedToCompliance: boolean;
  bvn: string;
  digitalSignature: File | Blob;
  dob: string; // Format: YYYY-MM-DD
  email: string;
  fullname: string;
  livelinessImage: File | Blob;
  otp: string;
  password: string;
  phone: string;
  pin: string;
  username: string;
  // Optional fields
  businessName?: string;
  businessAddress?: string;
  businessType?: string;
  rcNumber?: string;
  tinNumber?: string;
  annualTurnover?: number;
  businessDescription?: string;
}

export interface AddBusinessResponse {
  businessId: number;
  userId: number;
  message: string;
  status: string;
}

export interface AddDeviceTokenRequest {
  token: string;
  username: string;
}

export interface AddDeviceTokenApiResponse {
  status: string;
  message: string;
  data: boolean;
  erroors: string[] | null;
}

export interface LogoutResponse {
  id: number;
  userName: string | null;
  fullName: string | null;
  businessId: number;
  phone: string | null;
  email: string | null;
  customerId: string | null;
  userType: string | null;
  status: string | null;
  role: string | null;
  buinessName: string | null;
  accountNumber: string | null;
  accountType: string | null;
  passwordUpdateRequired: boolean;
  token: string | null;
}

export interface LogoutApiResponse {
  hasValue: boolean;
  value: LogoutResponse;
}

export interface UpdateUserPinRequest {
  id: number | string;
  oldPin?: string | null;
  newPin: string;
  userType?: string | null;
  otp?: string;
}

export interface UpdateUserPinResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  id: number; // User ID (int64)
  username: string; // Username is now required
  currentPasssword: string; // Note: 3 s's to match API typo (use empty string for first-time setup)
  newPasssword: string; // Note: 3 s's to match API typo, min length 5
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  username?: string; // Username from response
  accessToken?: string; // New access token to replace existing auth token
}

// Response wrapper types
type GenerateOTPApiResponse = ApiResponse<GenerateOTPResponse>;
type ValidateOTPApiResponse = ApiResponse<boolean>;
type AddBusinessApiResponse = ApiResponse<AddBusinessResponse>;
type UpdateUserPinApiResponse = ApiResponse<UpdateUserPinResponse>;
type ResetPasswordApiResponse = ApiResponse<ResetPasswordResponse>;

// ==============================================
// Mutation Functions
// ==============================================

/**
 * Generate OTP for business registration
 * @endpoint POST /GenerateOTPByBVN
 */
export const generateOTPByBVN = async (
  data: GenerateOTPRequest,
): Promise<GenerateOTPResponse> => {
  const response = await apiClient.post<GenerateOTPApiResponse>(
    "/GenerateOTPByBVN",
    data,
  );
  return response.data.data;
};

/**
 * Add device token for push notifications
 * @endpoint POST /AddDeviceToken
 */
export const addDeviceToken = async (
  data: AddDeviceTokenRequest,
): Promise<boolean> => {
  const response = await apiClient.post<AddDeviceTokenApiResponse>(
    "/AddDeviceToken",
    data,
  );
  return response.data.data;
};

/**
 * Validate OTP code
 * @endpoint POST /ValidateOTP
 */
export const validateOTP = async (
  data: ValidateOTPRequest,
): Promise<boolean> => {
  const response = await apiClient.post<ValidateOTPApiResponse>(
    "/ValidateOTP",
    data,
  );
  return response.data.data;
};

/**
 * Add/Register new business
 * @endpoint POST /AddBusiness
 * @note This endpoint uses multipart/form-data for file uploads
 */
export const addBusiness = async (
  data: AddBusinessRequest,
): Promise<AddBusinessResponse> => {
  const formData = new FormData();

  // Required fields
  formData.append("AgreedToCompliance", String(data.agreedToCompliance));
  formData.append("BVN", data.bvn);
  formData.append("DigitalSignature", data.digitalSignature);
  formData.append("DOB", data.dob);
  formData.append("Email", data.email);
  formData.append("Fullname", data.fullname);
  formData.append("LivelinessImage", data.livelinessImage);
  formData.append("Otp", data.otp);
  formData.append("Password", data.password);
  formData.append("Phone", data.phone);
  formData.append("Pin", data.pin);
  formData.append("Username", data.username);

  // Optional fields
  if (data.businessName) formData.append("BusinessName", data.businessName);
  if (data.businessAddress)
    formData.append("BusinessAddress", data.businessAddress);
  if (data.businessType) formData.append("BusinessType", data.businessType);
  if (data.rcNumber) formData.append("RCNumber", data.rcNumber);
  if (data.tinNumber) formData.append("TINNumber", data.tinNumber);
  if (data.annualTurnover)
    formData.append("AnnualTurnover", String(data.annualTurnover));
  if (data.businessDescription)
    formData.append("BusinessDescription", data.businessDescription);

  const response = await apiClient.post<AddBusinessApiResponse>(
    "/AddBusiness",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};

/**
 * Logout user
 * @endpoint POST /Logout
 */
export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutApiResponse>("/Logout");
  return response.data.value;
};

/**
 * Update user transaction PIN
 * @endpoint PUT /UpdateUserPin
 */
export const updateUserPin = async (
  data: UpdateUserPinRequest,
): Promise<UpdateUserPinResponse> => {
  const response = await apiClient.put<UpdateUserPinApiResponse>(
    "/UpdateUserPin",
    data,
  );
  return response.data.data;
};

/**
 * Reset user password (for first-time setup or password change)
 * @endpoint POST /ResetPassword
 * @note newPasssword has 3 s's - this is a typo in the API but must be used
 */
export const resetPassword = async (
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordApiResponse>(
    "/ResetPassword",
    data,
  );
  return response.data.data;
};

// ==============================================
// React Query Mutation Hooks
// ==============================================

/**
 * Hook for generating OTP by BVN
 * @usage const generateOTPMutation = useGenerateOTPMutation();
 */
export const useGenerateOTPMutation = () => {
  return useMutation({
    mutationFn: generateOTPByBVN,
  });
};

/**
 * Hook for validating OTP
 * @usage const validateOTPMutation = useValidateOTPMutation();
 */
export const useValidateOTPMutation = () => {
  return useMutation({
    mutationFn: validateOTP,
  });
};

/**
 * Hook for adding/registering business
 * @usage const addBusinessMutation = useAddBusinessMutation();
 * @note Invalidates 'businesses' query cache on success
 */
export const useAddBusinessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBusiness,
    onSuccess: () => {
      // Invalidate any business-related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

/**
 * Hook for adding device token
 * @usage const addDeviceTokenMutation = useAddDeviceTokenMutation();
 * @note Invalidates 'user' query cache on success
 */
export const useAddDeviceTokenMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDeviceToken,
    onSuccess: () => {
      // Invalidate user-related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

/**
 * Hook for user logout
 * @usage const logoutMutation = useLogoutMutation();
 * @note Clears all cached queries on success
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all cached queries on logout
      queryClient.clear();
      //       console.log('✅ Logout API call successful - cache cleared');
    },
  });
};

/**
 * Hook for updating user transaction PIN
 * @usage const updateUserPinMutation = useUpdateUserPinMutation();
 * @note Invalidates 'user' query cache on success
 */
export const useUpdateUserPinMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserPin,
    onSuccess: () => {
      // Invalidate user-related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      //       console.log('✅ PIN updated successfully');
    },
  });
};

/**
 * Hook for resetting/changing user password
 * @usage const resetPasswordMutation = useResetPasswordMutation();
 * @note Invalidates 'user' query cache on success
 * @note Used for both first-time password setup and password changes
 */
export const useResetPasswordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      // Invalidate user-related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      //       console.log('✅ Password updated successfully');
    },
  });
};
