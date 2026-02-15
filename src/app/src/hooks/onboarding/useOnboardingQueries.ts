import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import type { ApiResponse } from '../../types/api.types';


export interface ActivityLog {
  createdOn: string;
  activity: string;
  description: string;
}

type ActivityByUserApiResponse = ApiResponse<ActivityLog[]>;


export interface CustomerAccount {
  // Basic Account Info
  accountNumber: string;
  accountName: string;
  accountType: string;
  currency: string;
  currencyCode?: string;
  balance: number;
  availableBalance: number;
  blockedBalance?: number;
  customerId: string;

  // Account Status
  accountStatus?: string; // 'REGULAR', 'ACTIVE', etc.
  isStaff?: boolean;

  // Customer Contact Info
  emailAddress?: string;
  phoneNumber?: string;
  bvn?: string;

  // Customer Address
  strAddress1?: string;
  strAddress2?: string;
  strAddress3?: string;
  strCity?: string;
  strState?: string;
  country?: string;

  // Branch Information
  branchName?: string;
  branchAddress?: string;
  branchCode?: string;

  // Account Officer (format: "NAME:ID:PHONE:EMAIL")
  accountOfficer?: string;
}

type CustomerAccountsApiResponse = ApiResponse<CustomerAccount[]>;


export const fetchCustomerAccounts = async (
  customerId: string,
): Promise<CustomerAccount[]> => {
  const response = await apiClient.get<CustomerAccountsApiResponse>(
    "/GetCustomerAccounts",
    {
      params: { customerId },
    },
  );

  // Handle response data - may be wrapped in $values
  const data = response.data.data;
  if (Array.isArray(data)) {
    return data;
  }
  // Handle C# serialization format with $values
  if (data && typeof data === "object" && "$values" in data) {
    const dataWithValues = data as any;
    if (Array.isArray(dataWithValues.$values)) {
      return dataWithValues.$values;
    }
  }
  return [];
};

export const fetchActivityByUser = async (
  userId: number | string,
): Promise<ActivityLog[]> => {
  const response = await apiClient.get<ActivityByUserApiResponse>(
    `/ActivityByUser/${userId}`,
  );

  return response.data.data || [];
};

export const useCustomerAccountsQuery = (
  customerId: string,
  options?: Omit<UseQueryOptions<CustomerAccount[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CustomerAccount[], Error>({
    queryKey: ['customerAccounts', customerId],
    queryFn: () => fetchCustomerAccounts(customerId),
    enabled: !!customerId && customerId.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useActivityByUserQuery = (
  userId: number | string,
  options?: Omit<UseQueryOptions<ActivityLog[], Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<ActivityLog[], Error>({
    queryKey: ["activityByUser", userId],
    queryFn: () => fetchActivityByUser(userId),
    enabled:
      !!userId && (typeof userId === "string" ? userId.length > 0 : userId > 0),
    staleTime: 1000 * 60 * 2, // 2 minutes - activities are relatively fresh
    ...options,
  });
};

