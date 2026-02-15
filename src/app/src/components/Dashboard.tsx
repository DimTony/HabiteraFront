import { useState, useMemo } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Package,
  Bell,
  Settings,
  ShoppingCart,
  ChevronDown,
  FileText,
  ChevronUp,
  Users,
  Archive,
  BarChart3,
  Copy,
  Share2,
  Banknote,
  Mail,
  Phone,
  ExternalLink,
  Store,
} from "lucide-react";
import { useAccount } from "../contexts/AccountContext";
import { useAuthStore } from "../stores/useAuthStore";
// import { BannerCarousel } from './BannerCarousel';
// import { AccountShareModal } from './AccountShareModal';
// import { BusinessAccountRequiredDialog } from './BusinessAccountRequiredDialog';
// import { useTransactionHistoryQuery } from '../services/api/banking/useBankingQueries';
// import { useNotificationCount } from '../hooks/useNotificationCount';
import { toast } from "sonner";
import { useSafeArea } from "../hooks/useSafeAreaView";
import { useNotificationCount } from "../hooks/useNotificationCount";
// import { useSafeArea } from '../services/useSafeArea';

interface StaffData {
  id: string;
  email: string;
  profilePhoto: string;
  role: "Agent" | "User";
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

interface DashboardProps {
  staffName: string;
  staffData?: StaffData | null;
  selectedBusinessTools?: string[];
  transactionRefreshKey?: number;
  userPhoneNumber?: string;
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
  onSharePayment?: () => void;
  onNavigateToInvoice?: () => void;
  onNavigateToExpenses?: () => void;
  onRefreshTransactions?: () => void;
  onNavigateToInventoryView?: () => void;
  onNavigateToStaffManagement?: () => void;
  onNavigateToCategoryManagement?: () => void;
  onNavigateToAnalytics?: () => void;
  onNavigateToStores?: () => void;
}

interface Transaction {
  id: string;
  type: "inflow" | "outflow" | string;
  source: string;
  amount: number;
  date: string;
  time: string;
  runningBalance?: number;
}

export function Dashboard({
  staffName,
  staffData,
  selectedBusinessTools = ["sell", "invoice", "orders", "expenses"],
  transactionRefreshKey = 0,
  userPhoneNumber = "08160101010",
  onNavigateToTools,
  onNavigateToTransactions,
  onNavigateToOrders,
  onViewTransaction,
  onNavigateToAddProduct,
  onNavigateToStoreSetup,
  onNavigateToProductManagement,
  onNavigateToProducts,
  onNavigateToSell,
  onShowNotifications,
  onShowKYCProgress,
  onSharePayment,
  onNavigateToInvoice,
  onNavigateToExpenses,
  onRefreshTransactions,
  onNavigateToInventoryView,
  onNavigateToStaffManagement,
  onNavigateToCategoryManagement,
  onNavigateToAnalytics,
  onNavigateToStores,
}: DashboardProps) {
  const isBusinessAccount = useAuthStore((state) => state.isBusinessAccount());
  const [showBusinessAccountDialog, setShowBusinessAccountDialog] =
    useState(false);
  const [transactionFilter, setTransactionFilter] = useState<
    "all" | "inflow" | "outflow"
  >("all");
  const [showTransactions, setShowTransactions] = useState(true);
  const [isTransactionsCollapsed, setIsTransactionsCollapsed] = useState(false);
  const [showAccountShareModal, setShowAccountShareModal] = useState(false);

  // Wrapper function to check account type before navigating to business tools
  const handleBusinessToolClick = (onClick?: () => void) => {
    /** 
    if (!isBusinessAccount) {
      setShowBusinessAccountDialog(true);
      return;
    }
      */
    onClick?.();
  };

  // Get unread notification count
  const { unreadCount } = useNotificationCount();

  // Get safe area insets for proper bottom spacing on Android
  const { safeArea } = useSafeArea();

  // Use AccountContext for account management (includes store account for staff)

  // const {
  //   accounts: apiAccounts,
  //   selectedAccount,
  //   isLoading: isLoadingAccounts,
  //   error: accountsError,
  //   refetch: refetchAccounts,
  // } = useAccount();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  // Calculate 2-day lookback date range
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }, []);

  // Get staff account number from AccountContext (includes store account for staff with storeId)
  // const staffAccountNumber = useMemo(() => {
  //   // Use selected account from context (which includes store account for staff)
  //   if (selectedAccount?.accountNumber) {
  //     //       console.log('📊 [DASHBOARD] Using account from context:', {
  //     //         accountNumber: selectedAccount.accountNumber,
  //     //         accountName: selectedAccount.accountName,
  //     //         accountType: selectedAccount.accountType
  //     //       });
  //     return selectedAccount.accountNumber;
  //   }
  //   // Fallback to first API account if no selection
  //   //     console.log('📊 [DASHBOARD] No selected account, using first available');
  //   return apiAccounts?.[0]?.accountNumber || null;
  // }, [selectedAccount, apiAccounts]);

  // Fetch transaction history for staff's business account
  // const { data: transactionHistory, isLoading: transactionsLoading, refetch: refetchTransactions, isFetching: isFetchingTransactions } = useTransactionHistoryQuery(
  //   {
  //     accountNumber: staffAccountNumber,
  //     startDate: dateRange.startDate,
  //     endDate: dateRange.endDate
  //   },
  //   {
  //     enabled: !!staffAccountNumber,
  //     staleTime: 1000 * 60 * 2, // 2 minutes
  //   }
  // );

  // Group transactions into inflow/outflow with 10 record limit each
  // const groupedTransactions = useMemo(() => {
  //   const transactions = transactionHistory?.transactions || [];

  //   // Helper function to format date nicely
  //   const formatTransactionDate = (dateString?: string | null) => {
  //     if (!dateString) return '';
  //     try {
  //       const date = new Date(dateString);
  //       // Check if the date has meaningful time (not midnight UTC)
  //       const hasTime = date.getUTCHours() !== 0 || date.getUTCMinutes() !== 0;

  //       if (hasTime) {
  //         return date.toLocaleDateString('en-GB', {
  //           day: 'numeric',
  //           month: 'short',
  //           year: 'numeric',
  //           hour: '2-digit',
  //           minute: '2-digit'
  //         });
  //       }
  //       // Only show date if no time info available
  //       return date.toLocaleDateString('en-GB', {
  //         day: 'numeric',
  //         month: 'short',
  //         year: 'numeric'
  //       });
  //     } catch {
  //       return dateString;
  //     }
  //   };

  //   const inflow = transactions
  //     .filter(t => t.debitCredit === 'C')
  //     .slice(0, 10)
  //     .map((t, index) => ({
  //       id: `inflow-${index}`,
  //       type: 'inflow' as const,
  //       source: t.narration || 'No description',
  //       amount: parseFloat(t.amount || '0'),
  //       date: formatTransactionDate(t.statementDate),
  //       time: '', // Time is now included in date if available
  //       runningBalance: parseFloat(t.runningBalance || '0')
  //     }));

  //   const outflow = transactions
  //     .filter(t => t.debitCredit === 'D')
  //     .slice(0, 10)
  //     .map((t, index) => ({
  //       id: `outflow-${index}`,
  //       type: 'outflow' as const,
  //       source: t.narration || 'No description',
  //       amount: parseFloat(t.amount || '0'),
  //       date: formatTransactionDate(t.statementDate),
  //       time: '', // Time is now included in date if available
  //       runningBalance: parseFloat(t.runningBalance || '0')
  //     }));

  //   return [...inflow, ...outflow];
  // }, [transactionHistory, dateRange]);

  // // Filter transactions based on selected filter
  // const getFilteredTransactions = () => {
  //   // Staff users see all transactions (both inflow and outflow)
  //   return groupedTransactions;
  // };

  // // Handle refresh transactions
  // const handleRefreshTransactions = () => {
  //   setShowTransactions(true);
  //   // Refetch transactions from API
  //   refetchTransactions();
  //   // Call parent callback if provided
  //   if (onRefreshTransactions) {
  //     onRefreshTransactions();
  //   }
  // };

  // Toggle transactions section collapse
  const toggleTransactionsCollapse = () => {
    setIsTransactionsCollapsed(!isTransactionsCollapsed);
  };

  // Define all available business tools with their configurations (same as manager)
  const allBusinessTools = [
    {
      id: "sell",
      name: "Sell",
      icon: Package,
      color: "bg-green-100",
      iconColor: "text-green-600",
      onClick: () => handleBusinessToolClick(onNavigateToSell),
    },
    {
      id: "invoice",
      name: "Invoice",
      icon: FileText,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => handleBusinessToolClick(onNavigateToInvoice),
    },
    {
      id: "orders",
      name: "Orders",
      icon: ShoppingCart,
      color: "bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => handleBusinessToolClick(onNavigateToOrders),
    },
    {
      id: "expenses",
      name: "Expenses",
      icon: Banknote,
      color: "bg-red-100",
      iconColor: "text-red-600",
      onClick: () => handleBusinessToolClick(onNavigateToExpenses),
    },
    {
      id: "inventory",
      name: "Inventory",
      icon: Archive,
      color: "bg-indigo-100",
      iconColor: "text-indigo-600",
      onClick: () => handleBusinessToolClick(onNavigateToInventoryView),
    },
    {
      id: "staff-management",
      name: "Staff",
      icon: Users,
      color: "bg-pink-100",
      iconColor: "text-pink-600",
      onClick: () => handleBusinessToolClick(onNavigateToStaffManagement),
    },
    // {
    //   id: 'payroll',
    //   name: 'Payroll',
    //   icon: Calculator,
    //   color: 'bg-teal-100',
    //   iconColor: 'text-teal-600',
    //   onClick: onNavigateToPayroll
    // },
    {
      id: "category",
      name: "Category",
      icon: Settings,
      color: "bg-yellow-100",
      iconColor: "text-yellow-600",
      onClick: () => handleBusinessToolClick(onNavigateToCategoryManagement),
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: BarChart3,
      color: "bg-teal-100",
      iconColor: "text-teal-600",
      onClick: () => handleBusinessToolClick(onNavigateToAnalytics),
    },
    {
      id: "stores",
      name: "Stores",
      icon: Store,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => handleBusinessToolClick(onNavigateToStores),
    },
  ];

  // Get the currently displayed business tools (exactly 4)
  const displayedBusinessTools = selectedBusinessTools
    .map((toolId) => allBusinessTools.find((tool) => tool.id === toolId))
    .filter(Boolean);

  // Use API data if available, fallback to staff data from props only
  // const primaryAccount = apiAccounts?.[0];
  const userInfo = {
    name: staffData?.email || staffName,
    email: staffData?.email || "",
    // accountNumber: primaryAccount?.accountNumber || "",
    // businessName: primaryAccount?.accountName || "",
  };

  // Account data for sharing modal
  // const accountShareData = {
  //   accountNumber: userInfo.accountNumber,
  //   accountName: userInfo.businessName,
  //   bankName: "Access Bank Nigeria",
  //   businessName: userInfo.businessName,
  //   balance: 0, // Staff don't see balance
  //   // location: userInfo.location,
  //   // phone: userInfo.phone,
  //   email: userInfo.email,
  // };

  const handleShareAccount = () => {
    setShowAccountShareModal(true);
  };

  const copyAccountNumber = () => {
    // navigator.clipboard.writeText(userInfo.accountNumber);
    toast.success("Account number copied");
  };

  return (
    <div className="bg-primary text-white h-full flex flex-col">
      {/* Header - Spacious and Breathing (same as manager) */}
      <div className="px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={staffData?.profilePhoto || "/assets/default-avatar.png"}
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
                {staffData?.email || staffName || "User"}
              </h1>

              {/* Contact Info */}
              <div className="flex flex-col space-y-1 mt-2">
                <div className="flex items-center space-x-2 text-white/70 text-xs">
                  <Mail className="w-3.5 h-3.5" />
                  <span>
                    {staffData?.email || "ajiriogheneokeya@gmail.com"}
                  </span>
                  <button className="ml-1 hover:bg-white/10 rounded p-0.5 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-white/70 text-xs">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{staffData?.email || "08012345678"}</span>
                  <button className="ml-1 hover:bg-white/10 rounded p-0.5 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onShowNotifications}
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label={`Notifications${
                unreadCount > 0 ? `, ${unreadCount} unread` : ""
              }`}
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  aria-hidden="true"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className="bg-gray-50 flex-1 rounded-t-3xl px-6 py-4 text-gray-900 overflow-y-auto"
        style={{ paddingBottom: `${64 + safeArea.bottom}px` }}
      >
        {/* Business Account Card - Assigned to Staff */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-[#003883] to-[#004aa3] text-white border-0 rounded-xl p-3.5 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Business Account Label */}
                <span className="text-white/80 text-xs block mb-1.5">
                  {/* {userInfo.businessName} */}
                </span>

                {/* Account Number with Copy */}
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">
                    {/* {userInfo.accountNumber} */}
                  </span>
                  <button
                    title="Copy account number"
                    onClick={copyAccountNumber}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95 touch-manipulation"
                  >
                    <Copy className="w-4 h-4 text-white/80" />
                  </button>
                </div>
              </div>

              {/* Share Button */}
              <div className="flex items-start pt-1">
                <button
                  title="Share account"
                  onClick={handleShareAccount}
                  className="p-2.5 hover:bg-white/10 rounded-lg transition-colors active:scale-95 touch-manipulation"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Business Tools - Dynamic based on settings (same as manager) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Business</h3>
            <button
              onClick={onNavigateToTools}
              className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <Settings className="w-3 h-3" />
              <span>Customize</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {displayedBusinessTools.map((tool, i) => {
              if (!tool) return null;
              const IconComponent = tool.icon;
              return (
                <Card
                  key={tool.id + i}
                  className="p-3 bg-white border-0 rounded-xl hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                  onClick={tool.onClick}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center`}
                    >
                      <IconComponent className={`w-6 h-6 ${tool.iconColor}`} />
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 text-[11px] leading-tight">
                        {tool.name}
                      </h4>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Banner Carousel - Same as manager */}
        {/* <div className="mt-6 space-y-4">
          <BannerCarousel userRole="staff" />
        </div> */}

        {/* Recent Transactions - Staff Version */}
        <div className="space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 text-sm">
                Recent Transactions
              </h3>
              <button
                onClick={toggleTransactionsCollapse}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {isTransactionsCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Refresh button - Staff only sees refresh, no account selector */}
              {/* <button
                onClick={handleRefreshTransactions}
                disabled={isFetchingTransactions}
                className="flex items-center space-x-1.5 px-3 py-2.5 text-xs text-primary hover:bg-primary/5 rounded-lg transition-colors min-h-[44px] disabled:opacity-50"
              >
                {isFetchingTransactions ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Refresh</span>
              </button> */}
            </div>
          </div>

          {/* Staff see transactions directly without filter tabs */}
          {showTransactions && !isTransactionsCollapsed && (
            <div className="space-y-3">
              {/* Loading Spinner */}
              {/* {transactionsLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )} */}

              {/* Transactions List */}
              {/* {!transactionsLoading && (
                <>
                  {getFilteredTransactions().length > 0 ? (
                    <>
                      {getFilteredTransactions().slice(0, 10).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="bg-white rounded-2xl px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100 active:bg-gray-100 min-h-[68px] flex items-center"
                          onClick={() => onViewTransaction?.(transaction)}
                        >
                          <div className="flex justify-between items-center w-full">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-gray-700 text-sm truncate">
                                {transaction.source}
                              </p>
                              <p className="text-gray-500 text-xs mt-1">
                                {transaction.date}{transaction.time ? ` • ${transaction.time}` : ''}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`font-semibold text-sm ${
                                transaction.type === 'inflow'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}>{formatCurrency(transaction.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {getFilteredTransactions().length > 5 && (
                        <div className="pt-2">
                          <button
                            onClick={() => onNavigateToTransactions?.()}
                            className="w-full py-3.5 text-center text-primary text-xs hover:bg-gray-50 transition-colors rounded-xl bg-white border border-gray-200 min-h-[48px] active:bg-gray-100"
                          >
                            View All Transactions
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500 text-sm">No transactions found</p>
                    </div>
                  )}
                </>
              )} */}
            </div>
          )}
        </div>
      </div>

      {/* Account Share Modal */}
      {/* <AccountShareModal
        isOpen={showAccountShareModal}
        onClose={() => setShowAccountShareModal(false)}
        accountData={accountShareData}
      /> */}

      {/* Business Account Required Dialog */}
      {/* <BusinessAccountRequiredDialog
        open={showBusinessAccountDialog}
        onOpenChange={setShowBusinessAccountDialog}
      /> */}
    </div>
  );
}
