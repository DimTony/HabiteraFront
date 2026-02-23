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
import type { NewListingFormData } from "../../types/listing.types";

export const QUERY_KEYS = {
  properties: ["properties"] as const,
  property: (id: string) => ["properties", id] as const,
  agentProperties: (agentId: string) => ["agent-properties", agentId] as const,
  search: (params: any) =>
    ["properties", "search", params] as const,
};

export const submitNewListing = async (
  payload: NewListingFormData,
): Promise<any> => {
  const response = await apiClient.post<ApiResponse<any>>("/Property", payload);
  console.log("🔐 CREATE LISTING RESPONSE:", JSON.stringify(response, null, 2));

  if (response.data.statusCode !== 200) {
    window.location.reload();
  }

  const apiData = response.data.data;

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

  return apiData;
};

export const saveListingForLater = async (
  payload: NewListingFormData,
): Promise<any> => {
  try {
    const response = await apiClient.post<ApiResponse<any>>(
      "/Property/Draft",
      payload,
    );
    console.log(
      "🔐 SAVE FOR LATER RESPONSE:",
      JSON.stringify(response, null, 2),
    );

    // if (response.data.statusCode !== 201) {
    //   window.location.reload();
    // }

    const apiData = response.data;

    return apiData;
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

export const updateProperty = async (
  propertyId: string,
  payload: NewListingFormData,
): Promise<any> => {
  try {
    const response = await apiClient.put<ApiResponse<any>>(
      "/Property",
      payload,
      {
        params: {
          propertyId,
        },
      },
    );
    console.log(
      "🔐 SAVE FOR LATER RESPONSE:",
      JSON.stringify(response, null, 2),
    );

    // if (response.data.statusCode !== 201) {
    //   window.location.reload();
    // }

    const apiData = response.data;

    return apiData;
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

export const getListingById = async (propertyId: string): Promise<any> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      "/Property",
      {
        params: {
          propertyId,
        },
      },
    );
    console.log("🔐 Get Listing By ID RESPONSE:", JSON.stringify(response, null, 2));

    // if (response.data.statusCode !== 201) {
    //   window.location.reload();
    // }

    const apiData = response.data;

    return apiData;
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


export const deleteListing = async (propertyId: string): Promise<any> => {
  try {
    const response = await apiClient.delete<ApiResponse<any>>(
      "/Property/Delete",
      {
        params: {
          propertyId,
        },
      },
    );
    console.log(
      "🔐 Delete RESPONSE:",
      JSON.stringify(response, null, 2),
    );

    // if (response.data.statusCode !== 201) {
    //   window.location.reload();
    // }

    const apiData = response.data;

    return apiData;
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


export const useSubmitNewListingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, NewListingFormData>({
    mutationFn: submitNewListing,
    retry: 3, // Retry failed login attempts up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s
    onSuccess: () => {
      // Invalidate staff queries (use partial key to invalidate all staff queries)
      queryClient.invalidateQueries({ queryKey: ["new-listing"] });
    },
  });
};

export const useSaveListingForLaterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, NewListingFormData>({
    mutationFn: submitNewListing,
    retry: 3, // Retry failed login attempts up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s
    onSuccess: () => {
      // Invalidate staff queries (use partial key to invalidate all staff queries)
      queryClient.invalidateQueries({ queryKey: ["new-listing"] });
    },
  });
};

export const useUpdatePropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      dto,
    }: {
      propertyId: string;
      dto: NewListingFormData;
    }) =>
      apiClient.put<ApiResponse<any>>("/Property", dto, {
        params: {
          propertyId,
        },
      }),
    retry: 3, // Retry failed login attempts up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s
    // onSuccess: () => {
    //   // Invalidate staff queries (use partial key to invalidate all staff queries)
    //   queryClient.invalidateQueries({ queryKey: ["new-listing"] });
    // },
    onSuccess: (_, { propertyId }) => {
      // Invalidate the specific property detail
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.property(propertyId),
      });

      // Invalidate all search/listing pages
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.properties });
    },
  });
};

export const useDeleteListingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: deleteListing,
    retry: 3, // Retry failed login attempts up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s
    onSuccess: () => {
      // Invalidate staff queries (use partial key to invalidate all staff queries)
      queryClient.invalidateQueries({ queryKey: ["new-listing"] });
    },
  });
};

export function usePublishProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => apiClient.put<ApiResponse<any>>("/Property/Publish", {}, {
        params: {
          propertyId,
        },
      }),

    onSuccess: (_, propertyId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.property(propertyId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.properties });
    },
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: any) => apiClient.post<ApiResponse<any>>("/Property", dto),

    onSuccess: () => {
      // Just invalidate all property lists — new property needs to appear
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.properties });
    },
  });
}