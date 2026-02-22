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
  CompleteProfileRequest,
} from "../../types/api.types";
import apiClient from "../../api/apiClient";
import type { AgentFormData, UserFormData } from "../../types/profile.types";

export const completeUserProfile = async (
  payload: UserFormData,
): Promise<any> => {
  const response = await apiClient.post<ApiResponse<any>>(
    "/Profile/Complete/User",
    payload,
  );
  console.log(
    "🔐 COMPLETE User PROFILE RESPONSE:",
    JSON.stringify(response, null, 2),
  );

  if (response.data.statusCode !== 200) {
    window.location.reload();
  }

  const apiData = response.data.data;

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
      profilePhoto: apiData.user.profilePhoto,
      role: apiData.user.userType,
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

export const completeAgentProfile = async (
  payload: AgentFormData,
): Promise<any> => {
  try {
    const response = await apiClient.post<ApiResponse<any>>(
      "/Profile/Complete/Agent",
      payload,
    );
    console.log(
      "🔐 COMPLETE AGENT PROFILE RESPONSE:",
      JSON.stringify(response, null, 2),
    );

    if (response.data.statusCode !== 200) {
      window.location.reload();
    }

    const apiData = response.data.data;

    if (!response.data.data.token || !response.data.data.user) {
      const message = response?.data?.message || "Unable to login.";
      throw new Error(message);
    }

    const transformedResponse: LoginResponse = {
      success: response.data.success,
      message: response.data.message || "",
      statusCode: response.data.statusCode,
      token: response.data.data.token,
      refreshToken: response.data.data.refreshToken,
      user: {
        id: apiData.user.id,
        email: apiData.user.email,
        firstName: apiData.user.firstName,
        lastName: apiData.user.lastName,
        fullName: apiData.user.fullName,
        profilePhoto: apiData.user.profilePhoto,
        role: apiData.user.userType,
        status: apiData.user.status,
        createdAt: apiData.user.createdAt,
        updatedAt: apiData.user.updatedAt,
        lastLoginAt: apiData.user.lastLoginAt,
        profileCompleted: apiData.user.profileCompleted,
        profileCompletedAt: apiData.user.profileCompletedAt,
      },
    };

    return transformedResponse;
  } catch (error: any) {
    if (error.response) {
      // console.error("API ERROR DATA:", error.response.data);
      // console.error("API ERROR STATUS:", error.response.status);

      const message =
        error.response.data?.message ||
        error.response.data?.title ||
        "Request failed";

      throw message;
    }

    if (error.request) {
      console.error("NO RESPONSE RECEIVED:", error.request);
      throw new Error("No response from server.");
    }

    console.error("UNKNOWN ERROR:", error.message);
    throw new Error(error.message || "Something went wrong.");
  }
};

export const useCompleteUserProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UserFormData>({
    mutationFn: completeUserProfile,
    retry: 3, // Retry failed login attempts up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s
    onSuccess: () => {
      // Invalidate staff queries (use partial key to invalidate all staff queries)
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useCompleteAgentProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, AgentFormData>({
    mutationFn: completeAgentProfile,
    retry: 3, // Retry failed login attempts up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s
    onSuccess: () => {
      // Invalidate staff queries (use partial key to invalidate all staff queries)
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
