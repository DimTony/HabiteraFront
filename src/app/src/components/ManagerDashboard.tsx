import { useState } from "react";
import { Card } from "./ui/card";
import {
  Bell,
  RefreshCw,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import { useListingQuery } from "../hooks/business/useListingsQueries";
import type { LoginUserData } from "../types/api.types";


interface ManagerDashboardProps {
  staffName: string;
  staffData?: LoginUserData | null;
  currentKYCTier?: number;
  isFirstLogin?: boolean;
  selectedBusinessTools?: string[];
  transactionRefreshKey?: number;
  onNavigateToAddProperty?: () => void;
  onNavigateToTools?: () => void;
  onNavigateToTransactions?: (accountId?: string) => void;
  onNavigateToOrders?: () => void;
  onViewTransaction?: (transaction: Transaction) => void;
  onNavigateToAddProduct?: () => void;
  onNavigateToStoreSetup?: () => void;
  onNavigateToProductManagement?: () => void;
  onNavigateToProducts?: () => void;
  onNavigateToSell?: () => void;
  onShowNotifications?: () => void;
  onShowKYCProgress?: () => void;
  onNavigateToTopUp?: () => void;
  onNavigateToTransfer?: () => void;
  onNavigateToUtility?: () => void;
  onNavigateToAirtime?: () => void;
  onNavigateToData?: () => void;
  onNavigateToInvoice?: () => void;
  onNavigateToExpenses?: () => void;
  onRefreshTransactions?: () => void;
  // Additional navigation handlers for business tools
  onNavigateToInventoryView?: () => void;
  onNavigateToStoreAnalytics?: () => void;
  onNavigateToStaffManagement?: () => void;
  onNavigateToPayroll?: () => void;
  onNavigateToCategoryManagement?: () => void;
  onNavigateToBulkPayments?: () => void;
  onNavigateToApprovals?: () => void;
  // onNavigateToAnalytics?: () => void; // Analytics not integrated yet
}

interface Transaction {
  id: string;
  type: "inflow" | "outflow";
  source: string;
  amount: number;
  date: string;
  time: string;
}

export function ManagerDashboard({
  staffName,
  staffData,
  onShowNotifications,
  onNavigateToAddProperty
}: ManagerDashboardProps) {
  const [transactionFilter, setTransactionFilter] = useState<"active" | "review" | "inactive">("active");

  // Map UI filter to API status
  const getStatusFromFilter = (filter: typeof transactionFilter) => {
    switch (filter) {
      case "active":
        return "Active";
      case "review":
        return "UnderReview";
      case "inactive":
        return "Inactive";
      default:
        return "Active";
    }
  };

  const {
    data: listings,
    isLoading: listingsLoading,
    refetch: refetchListings,
    isFetching: isFetchingListings,
  } = useListingQuery(
    {
      status: getStatusFromFilter(transactionFilter),
      agentId: staffData?.id, // Filter by current agent
      pageSize: 10,
      pageNumber: 1,
    },
    {
      enabled: !!staffData?.id,
      staleTime: 1000 * 60 * 2,
    },
  );

  return (
    <div className="bg-primary text-white">
      <div className="px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={staffData?.profilePhoto || "/avatar.svg"}
                  alt={staffData?.email || "User"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                {/* Greeting */}
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-sm font-normal text-white/70">Hello,</h2>
                  {/* {isLoadingAccounts && (
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                      )} */}
                </div>

                {/* Name */}
                <h1 className="text-lg font-medium text-white">
                  {staffData?.firstName || staffName || "User"}
                </h1>
              </div>
            </div>

            <div className="flex flex-col space-y-1 mt-2">
              <div className="flex items-center space-x-2 text-white/70 text-xs">
                <Mail className="w-3.5 h-3.5" />
                <span>{staffData?.email || "ajiriogheneokeya@gmail.com"}</span>
                <button className="ml-1 hover:bg-white/10 rounded p-0.5 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center space-x-2 text-white/70 text-xs">
                <Phone className="w-3.5 h-3.5" />
                <span>{staffData?.status || "08012345678"}</span>
                <button className="ml-1 hover:bg-white/10 rounded p-0.5 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onShowNotifications}
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 flex-1 rounded-t-3xl px-6 py-4 text-gray-900 pb-20">
        <div className="space-y-3">
          {/* Filter buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setTransactionFilter("active")}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-medium transition-colors min-h-[44px] ${
                transactionFilter === "active"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
              }`}
            >
              Active Listings{" "}
              {listings?.totalCount ? `(${listings.totalCount})` : ""}
            </button>
            <button
              onClick={() => setTransactionFilter("review")}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-medium transition-colors min-h-[44px] ${
                transactionFilter === "review"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
              }`}
            >
              Under Review{" "}
              {listings?.totalCount ? `(${listings.totalCount})` : ""}
            </button>
            <button
              onClick={() => setTransactionFilter("inactive")}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-medium transition-colors min-h-[44px] ${
                transactionFilter === "inactive"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
              }`}
            >
              Inactive Listings{" "}
              {listings?.totalCount ? `(${listings.totalCount})` : ""}
            </button>
          </div>

          {/* Loading state */}
          {listingsLoading || isFetchingListings ? (
            <Card className="p-6 border-0 rounded-xl shadow-sm bg-white">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                <p className="text-sm text-gray-600">Loading listings...</p>
              </div>
            </Card>
          ) : listings?.items && listings.items.length > 0 ? (
            <div className="space-y-3">
              {listings.items.map((listing) => (
                <Card
                  key={listing.id}
                  className="p-4 border-0 rounded-xl shadow-sm bg-white"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={listing.images?.[0] || "/placeholder-property.jpg"}
                      alt={listing.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-500">{listing.address}</p>
                      <p className="text-lg font-semibold text-primary mt-1">
                        ₦{listing.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 border-0 rounded-xl shadow-sm bg-white">
              {/* <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  No {transactionFilter} listings found
                </p>
                <p className="text-xs text-gray-500">
                  Your {transactionFilter} listings will appear here
                </p>
              </div> */}

              <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <img
                  src={"/no-listing.png"}
                  alt={"No Listngs"}
                  className="w-50 h-50 rounded-lg object-cover"
                />
                <div className="flex flex-col items-center">
                  <p className="text-xl font-bold text-gray-500">
                    Showcase Your Property Today
                  </p>

                  <p className="text-sm text-gray-500 text-center mt-2">
                    List your propertites now and capture potential buyers and
                    tenants
                  </p>
                </div>

                <button
                  onClick={onNavigateToAddProperty}
                  className="mt-6 w-80 py-4 flex items-center justify-center bg-primary rounded-md "
                >
                  <span className="text-white text-sm ">List a Property</span>
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
