import * as InitialLoginScreenOverrides from "../api/services/login.service";

export const componentOverrides = {
  // Authentication Components
  InitialLoginScreen: InitialLoginScreenOverrides, // 🔥 DISABLED: Using mock implementation
  // InitialLoginScreen: undefined as any, // Forces fallback to mock data

  // Staff Management Components
  //   AddStaffScreen: StaffManagementOverrides,
  //   StaffManagementScreen: StaffManagementOverrides,
  //   StaffDetailScreen: StaffManagementOverrides,

  //   // Transfer Components
  //   AccessToAccessTransferScreen: TransferScreenOverrides,
  //   TransferScreen: TransferScreenOverrides,
  //   OtherBanksTransferScreen: TransferScreenOverrides,

  //   // Transaction Components
  //   TransactionsScreen: TransactionsScreenOverrides,
  //   // TransactionsScreen: undefined as any,

  //   // Store Management Components
  //   AddStoreScreen: StoreManagementOverrides,
  //   StoresScreen: StoreManagementOverrides,
  //   StoreDetailScreen: StoreManagementOverrides,
  //   EditStoreScreen: StoreManagementOverrides,

  //   // Customer Onboarding Components
  //   NewCustomerOnboardingScreen: NewCustomerOnboardingScreenOverrides,
  //   BusinessOwnerOnboardingScreen: BusinessOwnerOnboardingScreenOverrides,

  //   // Profile Creation Components
  //   CreateProfileScreen: CreateProfileScreenOverrides,

  //   // Business Tools Components
  //   BusinessToolsCustomizationScreen: BusinessToolsCustomizationScreenOverrides,

  //   // Business Management Components
  //   OrdersScreen: OrdersManagementOverrides,
  //   OrdersManagementScreen: OrdersManagementOverrides,
  //   OrderDetailScreen: OrdersManagementOverrides,
  //   AddOrderScreen: OrdersManagementOverrides,
  //   EditOrderScreen: OrdersManagementOverrides,

  //   ProductsScreen: ProductsManagementOverrides,
  //   ProductsManagementScreen: ProductsManagementOverrides,
  //   ProductDetailScreen: ProductsManagementOverrides,
  //   AddProductScreen: ProductsManagementOverrides,
  //   EditProductScreen: ProductsManagementOverrides,
  //   InventoryScreen: ProductsManagementOverrides,

  //   CategoriesScreen: CategoriesManagementOverrides,
  //   CategoryManagementScreen: CategoriesManagementOverrides,
  //   CategoryDetailScreen: CategoriesManagementOverrides,
  //   AddCategoryScreen: CategoriesManagementOverrides,
  //   EditCategoryScreen: CategoriesManagementOverrides,
  //   BusinessCategoryScreen: CategoriesManagementOverrides,

  //   // Sells Management Components
  //   SellsScreen: SellsManagementOverrides,
  //   SellsManagementScreen: SellsManagementOverrides,
  //   SellDetailScreen: SellsManagementOverrides,
  //   SellScreen: SellsManagementOverrides,
  //   AddSellScreen: SellsManagementOverrides,

  //   // Invoices Management Components
  //   InvoicesScreen: InvoicesManagementOverrides,
  //   InvoiceManagementScreen: InvoicesManagementOverrides,
  //   CreateInvoiceScreen: InvoicesManagementOverrides,
  //   InvoiceDetailScreen: InvoicesManagementOverrides,

  //   // Bulk Transfer Components
  //   BulkPaymentsScreen: BulkTransferOverrides,
  //   BulkTransferScreen: BulkTransferOverrides,
  //   PayrollScreen: BulkTransferOverrides,

  //   // Utility Bills Components
  //   AirtimeScreen: UtilityBillsOverrides,
  //   DataScreen: UtilityBillsOverrides,
  //   ElectricityScreen: UtilityBillsOverrides,
  //   CableTVScreen: UtilityBillsOverrides,
  //   UtilityScreen: UtilityBillsOverrides,
};

// Type for override functions
export type ComponentOverride = typeof componentOverrides;

// Helper function to get overrides for a component
export const getOverridesForComponent = (componentName: string) => {
  return componentOverrides[componentName as keyof typeof componentOverrides];
};
