import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import {
  Bell,
  RefreshCw,
  Mail,
  Phone,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
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
  onNavigateToInventoryView?: () => void;
  onNavigateToStoreAnalytics?: () => void;
  onNavigateToStaffManagement?: () => void;
  onNavigateToPayroll?: () => void;
  onNavigateToCategoryManagement?: () => void;
  onNavigateToBulkPayments?: () => void;
  onNavigateToApprovals?: () => void;
}

interface Transaction {
  id: string;
  type: "inflow" | "outflow";
  source: string;
  amount: number;
  date: string;
  time: string;
}

const PAGE_SIZE = 10;

export function ManagerDashboard({
  staffName,
  staffData,
  onShowNotifications,
  onNavigateToAddProperty,
}: ManagerDashboardProps) {
  const [transactionFilter, setTransactionFilter] = useState<
    "active" | "review" | "inactive"
  >("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [transactionFilter]);

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
    isFetching: isFetchingListings,
  } = useListingQuery(
    {
      status: getStatusFromFilter(transactionFilter),
      agentId: staffData?.id,
      pageSize: PAGE_SIZE,
      pageNumber: currentPage,
      search: debouncedSearch || undefined,
    },
    {
      enabled: !!staffData?.id,
      staleTime: 1000 * 60 * 2,
    },
  );

  const totalCount = listings?.totalRecords ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-primary text-white">
      {/* Header */}
      <div className="px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                <img
                  src={staffData?.profilePhoto || "/avatar.svg"}
                  alt={staffData?.email || "User"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-sm font-normal text-white/70">Hello,</h2>
                  <h1 className="text-lg font-medium text-white">
                    {staffData?.firstName || staffName || "User"}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-1 mt-2">
              <div className="flex items-center space-x-2 text-white/70 text-xs">
                <Mail className="w-3.5 h-3.5" />
                <span>{staffData?.email || ""}</span>
                <button className="ml-1 hover:bg-white/10 rounded p-0.5 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center space-x-2 text-white/70 text-xs">
                <Phone className="w-3.5 h-3.5" />
                <span>{staffData?.phoneNumber || "08012345678"}</span>
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

      {/* Main content */}
      <div className="bg-gray-50 flex-1 rounded-t-3xl px-6 py-4 text-gray-900 pb-20">
        <div className="space-y-3">
          {/* Filter buttons */}
          <div className="flex space-x-2">
            {(["active", "review", "inactive"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTransactionFilter(filter)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-medium transition-colors min-h-11 ${
                  transactionFilter === filter
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
                }`}
              >
                {filter === "active"
                  ? "Active Listings"
                  : filter === "review"
                  ? "Under Review"
                  : "Inactive Listings"}
              </button>
            ))}
          </div>

          {/* Search field */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search listings..."
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Loading state */}
          {listingsLoading || isFetchingListings ? (
            <Card className="p-6 border-0 rounded-xl shadow-sm bg-white">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                <p className="text-sm text-gray-600">Loading listings...</p>
              </div>
            </Card>
          ) : listings?.data && listings.data.length > 0 ? (
            <>
              <div className="space-y-3">
                {listings.data.map((listing) => (
                  <Card
                    key={listing.id}
                    className="p-4 border-0 rounded-xl shadow-sm bg-white"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={listing.images?.[0] || "/house.png"}
                        alt={listing.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex flex-col mb-2">
                          <h3 className="font-medium text-gray-900">
                            {listing.title}
                          </h3>
                          <div className="flex items-center gap-1">
                            <img
                              src={"/pin.svg"}
                              alt="pin"
                              className="w-3 h-3 object-cover"
                            />
                            <p className="text-sm text-gray-500">
                              {listing.fullAddress}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-md font-semibold text-primary">
                            ₦{listing.price.toLocaleString()}/{listing.tenor}
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              className="relative overflow-hidden group rounded-full w-8 h-8 
             flex items-center justify-center 
             border border-[#1C274C]
             transition-all duration-150
             hover:bg-[#1C274C] active:scale-95"
                            >
                              <span
                                className="absolute inset-0 bg-[#1C274C]/20 scale-0 
                   group-active:scale-100 
                   transition-transform duration-300 
                   rounded-full"
                              ></span>

                              <img
                                src="/edit.svg"
                                alt="edit"
                                className="w-5 h-5 relative z-10 group-hover:invert"
                              />
                            </button>

                            <button
                              className="relative overflow-hidden group rounded-full w-8 h-8 
             flex items-center justify-center 
             border border-[#1C274C]
             transition-all duration-150
             hover:bg-[#1C274C] active:scale-95"
                            >
                              <span
                                className="absolute inset-0 bg-[#1C274C]/20 scale-0 
                   group-active:scale-100 
                   transition-transform duration-300 
                   rounded-full"
                              ></span>
                              <img
                                src={"/trash.svg"}
                                alt="trash"
                                className="w-5 h-5 relative z-10 group-hover:invert"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-gray-500">
                    Page {currentPage} of {totalPages}
                    <span className="ml-1 text-gray-400">
                      ({totalCount} listing{totalCount !== 1 ? "s" : ""})
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={currentPage === 1}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page number pills */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1,
                        )
                        .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                          if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                            acc.push("...");
                          }
                          acc.push(page);
                          return acc;
                        }, [])
                        .map((item, idx) =>
                          item === "..." ? (
                            <span
                              key={`ellipsis-${idx}`}
                              className="w-7 text-center text-xs text-gray-400"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={item}
                              onClick={() => setCurrentPage(item as number)}
                              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                currentPage === item
                                  ? "bg-primary text-white"
                                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {item}
                            </button>
                          ),
                        )}
                    </div>

                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="p-6 border-0 rounded-xl shadow-sm bg-white">
              <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <img
                  src={"/no-listing.png"}
                  alt={"No Listings"}
                  className="w-50 h-50 rounded-lg object-cover"
                />
                <div className="flex flex-col items-center">
                  <p className="text-xl font-bold text-gray-500">
                    {debouncedSearch
                      ? "No listings found"
                      : "Showcase Your Property Today"}
                  </p>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    {debouncedSearch
                      ? `No results for "${debouncedSearch}". Try a different search term.`
                      : "List your properties now and capture potential buyers and tenants"}
                  </p>
                </div>

                {!debouncedSearch && (
                  <button
                    onClick={onNavigateToAddProperty}
                    className="mt-6 w-80 py-4 flex items-center justify-center bg-primary rounded-md"
                  >
                    <span className="text-white text-sm">List a Property</span>
                  </button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
