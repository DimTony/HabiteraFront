import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type {
  CreateStoreRequest,
  StoreApiResponse,
  StoresListApiResponse,
} from "../../types/api.types";
import apiClient from "../../api/apiClient";

// ==============================================
// Query Functions
// ==============================================

/**
 * Fetch all stores
 * @endpoint GET /api/Stores
 *
 * Note: API returns data wrapped in .NET's $values format:
 * { "data": { "$id": "2", "$values": [...] } }
 */
export const fetchStores = async (): Promise<CreateStoreRequest[]> => {
  try {
    const response = await apiClient.get<StoresListApiResponse>(
      "/Stores",
    );

    // Handle null, undefined, or missing data
    if (!response.data?.data) {
      return [];
    }

    // Handle .NET's $values wrapper format
    if (
      response.data.data &&
      typeof response.data.data === "object" &&
      "$values" in response.data.data
    ) {
      const valuesArray = (response.data.data as any).$values;
      if (Array.isArray(valuesArray)) {
        return valuesArray.filter((item) => item != null);
      }
    }

    // Handle direct array responses (backward compatibility)
    if (Array.isArray(response.data.data)) {
      return response.data.data.filter((item) => item != null);
    }

    // Single object response - wrap in array if valid
    return response.data.data != null ? [response.data.data] : [];
  } catch (error) {
    //     console.error('Error fetching stores:', error);
    return []; // Return empty array on error to allow fallback
  }
};

/**
 * Fetch single store by ID
 * @endpoint GET /api/Stores/{id}
 */
export const fetchStoreById = async (
  id: number,
): Promise<CreateStoreRequest> => {
  const response = await apiClient.get<StoreApiResponse>(`/Stores/${id}`);
  return response.data.data;
};

/**
 * Fetch stores by business ID
 * Note: API doesn't have a dedicated endpoint for this, so we fetch all stores.
 * The backend infers businessId from the authenticated user's token and filters automatically.
 * @endpoint GET /api/Stores (backend filters by auth token)
 */
export const fetchStoresByBusinessId = async (
  businessId: string | number,
): Promise<CreateStoreRequest[]> => {
  try {
    // Fetch all stores - backend should already filter by authenticated user's businessId
    const stores = await fetchStores();

    // Return all stores as backend handles filtering via auth token
    return stores;
  } catch (error) {
    //     console.error(`Error fetching stores for business ${businessId}:`, error);
    return [];
  }
};

// ==============================================
// React Query Hooks
// ==============================================

/**
 * Hook for fetching all stores
 */
export const useStoresQuery = (
  options?: Omit<
    UseQueryOptions<CreateStoreRequest[], Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<CreateStoreRequest[], Error>({
    queryKey: ["stores"],
    queryFn: fetchStores,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

/**
 * Hook for fetching single store
 */
export const useStoreQuery = (
  id: number,
  options?: Omit<
    UseQueryOptions<CreateStoreRequest, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<CreateStoreRequest, Error>({
    queryKey: ["stores", id],
    queryFn: () => fetchStoreById(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

/**
 * Hook for fetching stores by business ID
 * Note: Backend filters stores by authenticated user's businessId via token
 */
export const useStoresByBusinessIdQuery = (
  businessId: string | number | null,
  options?: Omit<
    UseQueryOptions<CreateStoreRequest[], Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<CreateStoreRequest[], Error>({
    queryKey: ["stores", "business", businessId],
    queryFn: () => fetchStoresByBusinessId(businessId!),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};
