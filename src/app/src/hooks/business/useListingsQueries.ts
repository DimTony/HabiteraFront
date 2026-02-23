import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type {
  ListingApiResponse,
  ListingResult,
  PropertySearchRequest,
} from "../../types/listing.types";
import apiClient from "../../api/apiClient";

export const fetchPropertyListings = async (
  query: PropertySearchRequest,
): Promise<ListingResult> => {
  console.log("QQQQQQQQQ", query);
  const response = await apiClient.post<ListingResult>(
    "/Property/Search",
    query,
  );
  return response.data;
};

const fetchActiveListings = async (query: PropertySearchRequest) => {
  const response = await apiClient.get<ListingResult>(
    "/Property/Search/Active",
    // query,
    {
      params: query
    }
  );
  return response.data;
};

const fetchUnderReviewListings = async (query: PropertySearchRequest) => {
  const response = await apiClient.get<ListingResult>(
    "/Property/Search/UnderReview",
    {
      params: query,
    },
  );
  return response.data;
};

const fetchInactiveListings = async (query: PropertySearchRequest) => {
  const response = await apiClient.get<ListingResult>(
    "/Property/Search/Inactive",
    {
      params: query,
    },
  );
  return response.data;
};

export const useListingQuery = (
  query: PropertySearchRequest,
  options?: Omit<
    UseQueryOptions<ListingResult, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ListingResult, Error>({
    queryKey: [
      query.city,
      query.state,
      query.country,
      query.status,
      query.agentId,
      query.pageNumber,
      query.pageSize,
    ],
    queryFn: async () => {
      if (query.status === "Active") return fetchActiveListings(query);
      if (query.status === "UnderReview")
        return fetchUnderReviewListings(query);
      if (query.status === "Inactive") return fetchInactiveListings(query);

      return fetchPropertyListings(query);
    },
    enabled: false,
    // enabled: !!query,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

// /**
//  * Fetch list of all banks
//  * @endpoint GET /BankList
//  */
// export const fetchBankList = async (): Promise<Bank[]> => {
//   const response = await bankingApiClient.get<BanksListApiResponse>('/BankList');
//   return response.data.data || [];
// };

// /**
//  * Get transaction status by reference
//  * @endpoint GET /TransactionStatus/{reference}
//  */
// export const fetchTransactionStatus = async (reference: string): Promise<TransactionStatusResponse> => {
//   const response = await bankingApiClient.get(`/TransactionStatus/${reference}`);
//   return response.data.data; // API returns wrapped response with .data field
// };

// /**
//  * Get interbank transaction status by reference
//  * @endpoint GET /InterbankTransactionStatus/{reference}
//  */
// export const fetchInterbankTransactionStatus = async (reference: string): Promise<TransactionStatusResponse> => {
//   const response = await bankingApiClient.get(`/InterbankTransactionStatus/${reference}`);
//   return response.data.data;
// };

// /**
//  * Fetch transaction history for an account
//  * @endpoint POST /TransactionHistory
//  */
// export const fetchTransactionHistory = async (query: TransactionHistoryQuery): Promise<TransactionHistoryResult> => {
//   const response = await bankingApiClient.post<TransactionHistoryApiResponse>('/TransactionHistory', query);
//   return response.data.data;
// };

// /**
//  * Generate account statement
//  * @endpoint POST /AccountStatement
//  */
// export const fetchAccountStatement = async (query: AccountStatementQuery): Promise<AccountStatementResult> => {
//   const response = await bankingApiClient.post<AccountStatementApiResponse>('/AccountStatement', query);
//   return response.data.data;
// };

// // ==============================================
// // React Query Hooks
// // ==============================================

// /**
//  * Hook for fetching bank list
//  */
// export const useBankListQuery = (
//   options?: Omit<UseQueryOptions<Bank[], Error>, 'queryKey' | 'queryFn'>
// ) => {
//   return useQuery<Bank[], Error>({
//     queryKey: ['banks', 'list'],
//     queryFn: fetchBankList,
//     staleTime: 1000 * 60 * 60, // 1 hour - bank list doesn't change often
//     gcTime: 1000 * 60 * 60 * 2, // 2 hours
//     ...options,
//   });
// };

// /**
//  * Hook for fetching transaction status
//  */
// export const useTransactionStatusQuery = (
//   reference: string,
//   options?: Omit<UseQueryOptions<TransactionStatusResponse, Error>, 'queryKey' | 'queryFn'>
// ) => {
//   return useQuery<TransactionStatusResponse, Error>({
//     queryKey: ['transaction', 'status', reference],
//     queryFn: () => fetchTransactionStatus(reference),
//     enabled: !!reference,
//     staleTime: 1000 * 60 * 2, // 2 minutes
//     ...options,
//   });
// };

// /**
//  * Hook for fetching interbank transaction status
//  */
// export const useInterbankTransactionStatusQuery = (
//   reference: string,
//   options?: Omit<UseQueryOptions<TransactionStatusResponse, Error>, 'queryKey' | 'queryFn'>
// ) => {
//   return useQuery<TransactionStatusResponse, Error>({
//     queryKey: ['transaction', 'interbank-status', reference],
//     queryFn: () => fetchInterbankTransactionStatus(reference),
//     enabled: !!reference,
//     staleTime: 1000 * 60 * 2, // 2 minutes
//     ...options,
//   });
// };

// /**
//  * Hook for generating account statement
//  */
// export const useAccountStatementQuery = (
//   query: AccountStatementQuery,
//   options?: Omit<UseQueryOptions<AccountStatementResult, Error>, 'queryKey' | 'queryFn'>
// ) => {
//   return useQuery<AccountStatementResult, Error>({
//     queryKey: ['account', 'statement', query.accountNumber, query.fromDate, query.toDate, query.signedStatement],
//     queryFn: () => fetchAccountStatement(query),
//     enabled: !!query.accountNumber && !!query.fromDate && !!query.toDate,
//     staleTime: 1000 * 60 * 10, // 10 minutes - statements are relatively static
//     gcTime: 1000 * 60 * 60, // 1 hour
//     ...options,
//   });
// };

// /**
//  * Fetch transaction limits configuration
//  * @endpoint GET /TransactionLimits
//  * @returns Maximum limits for daily, single transaction, PIN, and token transactions
//  */
// export const fetchTransactionLimits = async (): Promise<TransactionLimitsResponse> => {
//   const response = await bankingApiClient.get<TransactionLimitsApiResponse>('/TransactionLimits');
//   return response.data.data;
// };

// /**
//  * Fetch daily transaction usage
//  * @endpoint GET /TransactionLimits/DailyUsage
//  * @returns Current day's transaction usage including total transacted, remaining limit, and percentage used
//  */
// export const fetchDailyUsage = async (): Promise<DailyUsageResponse> => {
//   const response = await bankingApiClient.get<DailyUsageApiResponse>('/TransactionLimits/DailyUsage');
//   return response.data.data;
// };

// /**
//  * Generate email OTP
//  * @endpoint POST /GenerateEmailOTP
//  * @param request Email OTP generation request
//  * @returns OTP generation response
//  */
// export const generateEmailOTP = async (request: GenerateEmailOTPRequest): Promise<GenerateEmailOTPResponse> => {
//   try {
//     const params = new URLSearchParams();
//     params.append('email', request.email);
//     const response = await onboardingLoginApiClient.post<GenerateEmailOTPApiResponse>('/GenerateEmailOTP', {}, { params });

//     if (response.data.status?.toLowerCase() !== 'success') {
//       throw new Error(response.data.message || 'Failed to send OTP email');
//     }

//     return response.data.data || {
//       success: true,
//       message: 'OTP sent successfully',
//     };
//   } catch (error) {
//     throw new Error('Unable to send OTP email. Please try again later.');
//   }
// };

// /**
//  * Hook for fetching transaction limits configuration
//  * @usage const { data: limits } = useTransactionLimitsQuery();
//  * @returns Transaction limit configuration (daily, single, PIN, token limits)
//  */
// export const useTransactionLimitsQuery = (
//   options?: Omit<UseQueryOptions<TransactionLimitsResponse, Error>, 'queryKey' | 'queryFn'>
// ) => {
//   return useQuery<TransactionLimitsResponse, Error>({
//     queryKey: ['transaction', 'limits'],
//     queryFn: fetchTransactionLimits,
//     staleTime: 1000 * 60 * 5, // 5 minutes - limits don't change often
//     gcTime: 1000 * 60 * 10, // 10 minutes
//     ...options,
//   });
// };

// /**
//  * Hook for fetching daily transaction usage
//  * @usage const { data: usage } = useDailyUsageQuery();
//  * @returns Current day's usage with totalTransacted, remaining, and percentageUsed
//  */
// export const useDailyUsageQuery = (
//   options?: Omit<UseQueryOptions<DailyUsageResponse, Error>, 'queryKey' | 'queryFn'>
// ) => {
//   return useQuery<DailyUsageResponse, Error>({
//     queryKey: ['transaction', 'dailyUsage'],
//     queryFn: fetchDailyUsage,
//     staleTime: 1000 * 60 * 2, // 2 minutes - usage changes frequently
//     refetchInterval: 1000 * 60 * 2, // Auto-refetch every 2 minutes
//     gcTime: 1000 * 60 * 5, // 5 minutes
//     ...options,
//   });
// };

// /**
//  * Hook for generating email OTP
//  * @usage const { mutate: generateOTP } = useGenerateEmailOTPMutation();
//  * @returns Mutation for sending email OTP
//  */
// export const useGenerateEmailOTPMutation = () => {
//   return useMutation<GenerateEmailOTPResponse, Error, GenerateEmailOTPRequest>({
//     mutationFn: generateEmailOTP,
//   });
// };
