// Generated from OpenAPI specifications
// DO NOT EDIT - Regenerate using API to React Query Converter Agent

import { type ReactNode } from "react";

// ==============================================
// Common Response Types
// ==============================================

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}

// ==============================================
// Authentication & Onboarding Types
// ==============================================

export interface LoginRequest {
  // username: string;
  // password: string;
  deviceId: string;
  // otp?: string; // Optional OTP for device verification
  email: string;
  password: string;
}

export interface UpdateStore {
  storeAccountName: string;
  storeAccountNumber: string;
  storeBank: string;
}

export interface LoginUserData {
  id: string;
  profilePhoto: string;
  userType: "Agent" | "User";
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  email: string;
  profileCompleted: boolean;
  profileCompletedAt: string;
  // firstName: string | null;
  // lastName: string | null;
  // city: string | null;
  // state: string | null;
  // country: string | null;
  // latitude: number;
  // longitude: number;
  // preferredLanguage: string | null;
  // emailNotifications: boolean;
  // pushNotifications: boolean;
  // licenseNumber: string | null;
  // agencyName: string | null;
  // averageRating: string | null;
  // totalReviews: string | null;
}

// Actual API response structure from POST /Login
export interface LoginApiResponseData {
  token: string | null;
  refreshToken: string;
  user: LoginUserData;
  error: string | null;
  timestamp: string;

  // id: number;
  // userName: string | null;
  // fullName: string | null;
  // businessId: string | null;
  // phone: string | null;
  // email: string | null;
  // customerId: string | null;
  // userType: string | null; // e.g., "BusinessOwner", "Staff", "Manager"
  // status: string | null; // e.g., "New", "Active"
  // role: string | null; // e.g., "BusinessOwner", "Staff", "Manager"
  // buinessName: string | null; // Note: typo in API response
  // token: string; // JWT token for authentication
  // inAppToken: string; // In-app token for additional authorization
  // passwordUpdateRequired: boolean; // Whether user must change password on first login
  // pinSetupRequired: boolean; // Whether user must set up transaction PIN
  // storedId?: number | null; // Store ID for staff members - used to fetch store details
  // isTotpEnabled?: boolean; // Whether TOTP (2FA) is enabled
  // responseCode?: string | null; // Response code from API (e.g., "01" for device ID change)
  // accountType?: string | null; // Account type (e.g., "CORP", "IND")
}

// Transformed response for app consumption (backward compatible)
export interface LoginResponse {
  success: boolean;
  message: string;
  statusCode: number;
  token: string;
  refreshToken: string;
  // profileComplete: boolean;
  user: {
    id: string;
    email: string;
    profilePhoto: string;
    role: "Agent" | "User";
    status: string;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
    profileCompleted?: boolean;
    profileCompletedAt: string | null;
  };
}

// export interface LoginResponseWrapper {
//   hasValue: boolean;
//   value: LoginResponseData;
// }

export interface RegisterUserRequest {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  phonenumber: string;
  email: string;
  deviceId: string;
  otp?: string; // OTP code for email verification
}

// ==============================================
// Customer Account & OTP Types
// ==============================================

/**
 * Customer account data from GetCustomerAccountsByPhone endpoint
 */
export interface CustomerAccount {
  accountNumber: string;
  accountName: string;
  accountType: string;
  balance?: number;
  currency?: string;
  status?: string;
}

/**
 * Request to get customer accounts by phone number
 * @endpoint GET /GetCustomerAccountsByPhone
 */
export interface GetCustomerAccountsByPhoneRequest {
  phoneNumber: string;
}

/**
 * Response from GetCustomerAccountsByPhone endpoint
 */
export type GetCustomerAccountsByPhoneApiResponse = ApiResponse<
  CustomerAccount[]
>;

/**
 * Request to generate email OTP
 * @endpoint POST /GenerateEmailOTP
 */
export interface GenerateEmailOTPRequest {
  email: string;
}

/**
 * Response from GenerateEmailOTP endpoint
 */
export interface GenerateEmailOTPResponse {
  success: boolean;
  message: string;
  recipientId?: string;
}

/**
 * API response wrapper for GenerateEmailOTP
 */
export type GenerateEmailOTPApiResponse = ApiResponse<GenerateEmailOTPResponse>;

// ==============================================
// Forgot Password Flow Types
// ==============================================

/**
 * Request to generate OTP for forgot password flow
 * @endpoint POST /GenerateOTPByUsername?username={username}
 */
export interface GenerateOTPByUsernameRequest {
  username: string;
}

/**
 * Request to validate OTP during forgot password
 * @endpoint POST /ValidateOTP
 */
export interface ValidateOTPForgotPasswordRequest {
  otp: string;
  recipientId: string; // From GenerateOTPByUsername response
}

/**
 * Request to complete forgot password flow
 * @endpoint POST /ForgotPassword
 * Note: API has typo - uses "newPasssword" with 3 s's
 */
export interface ForgotPasswordRequest {
  username?: string | null;
  newPasssword: string; // Note: 3 s's to match API typo, min length 5
  otp: string;
}

/**
 * Request to reset password (when user knows current password)
 * @endpoint POST /ResetPassword
 * Note: API has typo - uses "currentPasssword" and "newPasssword" with 3 s's
 */
export interface ResetPasswordRequest {
  id: number; // User ID (int64)
  username: string;
  currentPasssword: string; // Note: 3 s's to match API typo
  newPasssword: string; // Note: 3 s's to match API typo, min length 5
}

/**
 * Response from ForgotPassword and ResetPassword endpoints
 * Returns same structure as Login response
 */
export type ForgotPasswordResponse = LoginApiResponseData;
export type ResetPasswordResponse = LoginApiResponseData;

export interface BvnResponse {
  bvn?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  registrationDate?: string | null;
  enrollmentBank?: string | null;
  enrollmentBranch?: string | null;
  watchListed?: string | null;
  responseCode?: string | null;
}

export interface StaffCredentials {
  userName?: string | null;
  password?: string | null;
}

/**
 * Staff item from GET /StaffsByBusinessId/{businessId}
 * Note: Swagger docs incorrectly show this returns StaffCredentials,
 * but the actual API returns an array of full staff objects
 */
export interface StaffListItem {
  id: number;
  fullName: string;
  userName: string;
  phone: string;
  role: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  businessId: number;
}

export interface StoreRef {
  storeId: number;
}

export interface StaffRequest {
  fullName: string;
  userName: string;
  phone: string;
  email: string; // Required field for staff creation
  businessId: number;
  role: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  stores?: StoreRef[] | null;
}

export interface StaffUpdateRequest {
  id?: number;
  fullName?: string | null;
  phone?: string | null;
  role?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
}

// ==============================================
// Account Enquiry Types
// ==============================================

export interface AccountsByPhoneNumberRequest {
  phoneNumber: string;
  appId: string;
}

export interface AccountDetails {
  accountNumber: string;
  alternateAccount: string;
  accountName: string;
  accountType: string;
  productCode: string;
  productCodeDesc: string;
  currencyCode: string;
  currency: string;
  accountStatus: string;
  bvn: string;
  availableBalance: number;
  blockedBalance: number;
  accountOpenDate: string;
  emailAddress: string;
  phoneNumber: string;
  customerId: string;
  branchName: string;
  branchAddress: string;
  branchCode: string;
  isStaff: boolean;
  customerCategory: string;
  customerCategoryDesc: string;
  accountOfficer: string;
  strAddress1: string;
  strAddress2: string;
  strAddress3: string;
  strCity: string;
  strState: string;
  country: string;
  compMIS2: string;
  compMIS4: string;
  compMIS8: string | null;
  tin: string | null;
}

export interface AccountsByPhoneNumberResponse {
  status: string;
  message: string;
  data: AccountDetails[];
}

// ==============================================
// Banking & Transaction Types
// ==============================================

export interface Bank {
  name?: string | null;
  code?: string | null;
}

export interface NameEnquiryRequest {
  accountNumber?: string | null;
  bankCode?: string | null;
  senderAccount?: string | null;
}

export interface NameEnquiryResponse {
  accountNumber?: string | null;
  accountName?: string | null;
  availableBalance?: string | null;
  accountType?: string | null;
  bank?: string | null;
  bankCode?: string | null;
  bvn?: string | null;
  kycLevel?: string | null;
  sessionId?: string | null;
}

export interface FundsTransferRequest {
  transactionPin?: string | null;
  sourceAccount?: string | null;
  destinationAccount?: string | null;
  amount: number;
  narration?: string | null;
  bankCode?: string | null;
  sourceBvn?: string | null;
  sourceAccountName?: string | null;
  destinationBvn?: string | null;
  destinationAccountName?: string | null;
  kycLevel?: string | null;
  nameEnquirySessionId?: string | null;
  otp?: string | null;
}

export interface FundsTransferResponse {
  responseCode?: string | null;
  responseMessage?: string | null;
  transactionReference?: string | null;
  institutionReference?: string | null;
  amount: number;
  senderName?: string | null;
  recipientName?: string | null;
  isInterbank: boolean;
  providerCode?: string | null;
}

// TransactionStatusResponse uses snake_case (as per OpenAPI spec)
export interface TransactionStatusResponse {
  response_code?: string | null;
  response_message?: string | null;
  record_count?: string | null;
  response_time?: string | null;
  msg_id?: string | null;
  source_code?: string | null;
  institution_reference?: string | null;
}

export interface TransactionHistoryQuery {
  accountNumber?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface TransactionItem {
  transactionDate?: string | null;
  statementDate?: string | null;
  valueDate?: string | null;
  transactionReference?: string | null;
  narration?: string | null;
  debitCredit?: string | null;
  amount?: string | null;
  runningBalance?: string | null;
}

export interface TransactionHistoryResult {
  responseCode?: string | null;
  responseMessage?: string | null;
  transactions?: TransactionItem[] | null;
  accountName?: string | null;
  accountNumber?: string | null;
  availableBalance?: string | null;
  clearedBalance?: string | null;
  openingBalance?: string | null;
  closingBalance?: string | null;
}

export interface AccountStatementQuery {
  accountNumber?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  emailAddress?: string | null;
  accountToDebit?: string | null;
  signedStatement: boolean;
}

export interface AccountStatementResult {
  responseCode?: string | null;
  responseMessage?: string | null;
  transactionReference?: string | null;
  generatedPdf?: string | null;
}

// ==============================================
// Business Management Types
// ==============================================

export enum CategoryType {
  Type1 = 1,
  Type2 = 2,
}

export enum OrderStatusEnum {
  Pending = 1,
  Processing = 2,
  Completed = 3,
}

export interface CreateCategoryRequest {
  name: string;
  address: string;
  description: string;
  city: string;
  state: string;
  categoryType: CategoryType;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string | null;
  description?: string | null;
}

export interface CreateStoreRequest {
  name: string;
  address: string;
  description: string;
  city: string;
  state: string;
  managerId?: number; // Optional: Stores can be created without a manager (0 = "No Manager")
  businessOwnerId?: number; // Business owner ID from login response (added by override handler)
  isActive?: boolean;
  storeAccountName: string;
  storeAccountNumber: string;
  storeBank: string;
  balance?: number; // Store account balance from API response
  availableBalance?: number; // Alternative field name for balance
  customerId?: string;
}

// Order Types
export interface CreateOrderDetailRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhoneNumber: string;
  customerDeliveryAddress: string;
  customerEmailAddress: string; // Fixed: Changed from number to string to match Swagger schema
  note?: string | null;
  deliveryDate?: string;
  orderAmount: number;
  orderDetailRequest?: CreateOrderDetailRequest[] | null;
}

// Order Link Types (POST /Orders/PaymentLink)
export interface AddOnlineOrderDetailRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface AddOnlineOrderRequest {
  linkName: string;
  description?: string | null;
  expirationDate?: string | null; // ISO date-time string
  staffId: number;
  onlineOrderDetailRequests: AddOnlineOrderDetailRequest[];
}

// Customer Order from Link (POST /Orders/OnlineOrder)
export interface AddCustomerOnlineOrderDetailRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface AddCustomerOnlineOrderRequest {
  customerName: string;
  customerPhoneNumber: string;
  customerDeliveryAddress: string;
  customerEmailAddress: string;
  note?: string | null;
  deliveryDate?: string | null; // ISO date-time string
  orderAmount: number;
  orderNumber: string; // Format: "C-ORD-365471473225559951"
  customerOnlineOrderDetailRequest: AddCustomerOnlineOrderDetailRequest[];
}

// Order Link Response (POST /Orders/PaymentLink response)
export interface OnlineOrderDetailResponse {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
}

export interface OrderLinkResponse {
  linkName: string;
  description: string;
  expirationDate: string;
  isConfirmed: boolean;
  confirmationDate: string;
  orderNumber: string;
  orderLink: string;
  onlineOrderDetailsResponse:
    | {
        $id?: string;
        $values?: OnlineOrderDetailResponse[];
      }
    | OnlineOrderDetailResponse[];
}

export interface UpdateOrderRequest {
  cancel?: boolean;
  orderStatus?: OrderStatusEnum;
}

export interface CloseOrderRequest {
  cancel: boolean;
  orderStatus: string; // "Open", "Placed", "PendingDelivery", "Delivered", "RefundInitiated", "Refund", "Closed", "Cancelled"
}

// Order Response Types (actual API response structure)
export interface OrderDetailResponse {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  productName?: string;
  createdOn?: string;
  isVatable?: boolean;
  isVatApplied?: boolean;
}

export interface OrderResponse {
  id: number;
  customerName: string;
  customerPhoneNumber: string;
  customerEmailAddress: string;
  customerDeliveryAddress: string;
  orderAmount: number;
  orderLink: string;
  note: string;
  deliveryDate: string;
  createdAt: string;
  createdOn?: string;
  updatedAt: string;
  isPaymentMade: boolean;
  paymentDate: string;
  orderStatus: string; // "Open", "Delivered", "Closed"
  orderDetails: OrderDetailResponse[] | { $values: OrderDetailResponse[] };
  orderTotalAmountWithVAT?: number;
  vat?: number | null;
  vatAmount?: number | null;
}

// Product Types
export interface CreateProductRequest {
  name: string;
  description?: string | null;
  price: number;
  stockCount: number | null;
  image?: string | null;
  inStock?: boolean;
  isVatApplied?: boolean;
  categoryId?: number; // Fixed: Changed from string to number to match Swagger schema (integer/int64)
}

export interface UpdateProductRequest {
  name: string;
  description?: string | null;
  price: number;
  stockCount: number | null;
  image?: string | null;
  inStock?: boolean;
  isVatApplied?: boolean;
}

// Store Types (additional to CreateStoreRequest)
export interface UpdateStoreRequest {
  name?: string | null;
  address?: string | null;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  managerId?: number | null; // Fixed: Changed from string to number to match Swagger schema (integer/int64)
  isActive?: boolean;
  storeAccountName?: string | null;
  storeAccountNumber?: string | null;
  storeBank?: string | null;
}

// ==============================================
// Sells/Sales Management Types
// ==============================================

export interface CreateSellDetailRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSellRequest {
  customerName?: string | null;
  customerPhoneNumber?: string | null;
  customerEmailAddress?: string | null;
  sellDetailRequest?: CreateSellDetailRequest[] | null;
  sellAmount: number;
}

export interface UpdateSellRequest {
  isPaymentReceived?: boolean;
  paymentMethod?: "NotPaid" | "BankTransfer" | "Card" | "Cash";
}

export interface SellDetailResponse {
  productId: number;
  quantity: number;
  unitPrice: number;
  productName?: string;
  createdOn?: string;
  isVatable?: boolean;
  isVatApplied?: boolean;
}

export interface SellResponse {
  id: number;
  createdOn: string;
  customerName?: string | null;
  customerPhoneNumber?: string | null;
  customerEmailAddress?: string | null;
  sellDetailResponse?: SellDetailResponse[] | null;
  sellAmount: number;
  isPaymentReceived: boolean;
  paymentMethod: string;
  sellTotalAmountWithVAT?: number;
  vat?: number | null;
  vatAmount?: number | null;
}

// ==============================================
// Bulk Transfer Types
// ==============================================

export interface TransferItem {
  sourceAccount?: string | null;
  destinationAccount?: string | null;
  bankCode?: string | null;
  amount: number;
  sourceBvn?: string | null;
  sourceAccountName?: string | null;
  destinationBvn?: string | null;
  destinationAccountName?: string | null;
  kycLevel?: string | null;
}

export interface SingleTransferItem {
  sourceAccount?: string | null;
  destinationAccount?: string | null;
  amount: number;
  sourceBvn?: string | null;
  sourceAccountName?: string | null;
  destinationBvn?: string | null;
  destinationAccountName?: string | null;
  kycLevel?: string | null;
}

export interface BulkTransferRequest {
  transactionPin?: string | null;
  transfers?: TransferItem[] | null;
  narration?: string | null;
  otp?: string | null;
}

export interface BulkIntrabankTransferRequest {
  transactionPin?: string | null;
  transfers?: SingleTransferItem[] | null;
  narration?: string | null;
  otp?: string | null;
}

export interface BulkTransferResult {
  isSuccessful: boolean;
  responseCode?: string | null;
  responseMessage?: string | null;
  transactionReference?: string | null;
  institutionReference?: string | null;
  sourceAccount?: string | null;
  destinationAccount?: string | null;
  bankCode?: string | null;
  amount: number;
  isInterbank: boolean;
  providerCode?: string | null;
}

export interface BulkTransferResponse {
  totalTransfers: number;
  successfulTransfers: number;
  failedTransfers: number;
  intrabankCount: number;
  interbankCount: number;
  totalAmount: number;
  transferResults?: BulkTransferResult[] | null;
}

// ==============================================
// Bulk Transfer CSV Types
// ==============================================

export interface BulkTransferCsvRequest {
  sourceAccount?: string | null;
  narration?: string | null;
  csvFile?: string | null; // Base64 encoded CSV file content
}

export interface CsvValidationError {
  row: number;
  field?: string | null;
  message?: string | null;
}

export interface BulkTransferCsvResponse {
  isValid: boolean;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errors?: CsvValidationError[] | null;
  preview?: TransferItem[] | null;
  transactionReference?: string | null;
}

export interface CsvFormat {
  headers?: string[] | null;
  sampleData?: string[][] | null;
  requiredFields?: string[] | null;
  fieldDescriptions?: { [key: string]: string };
  maxRecords: number;
  fileFormat?: string | null;
}

// ==============================================
// Airtime & Data Purchase Types
// ==============================================

export interface Operator {
  id?: string | null;
  name?: string | null;
  // code?: string | null;
  // operatorType?: string | null; // 'airtime' | 'data'
  // isActive: boolean;
}

export interface OperatorProduct {
  id?: string | null;
  productId?: string | null;
  operatorId?: string | null;
  name?: string | null;
  amount: number;
  validity?: string | null;
  description?: string | null;
  productType?: string | null; // 'airtime' | 'data'
}

export interface DataProduct {
  // id?: string | null;
  // productId?: string | null;
  // operatorName?: string | null;
  // operator?: string | null; // API uses 'operator' not 'operatorName'
  // provider?: string | null;
  // name?: string | null;
  // size?: string | null; // e.g., "1GB", "5GB"
  // dataBundle?: string | null; // API uses 'dataBundle'
  // amount: string; // API returns amount as string, not number!
  // validity?: string | null; // e.g., "30 Days"
  // category?: string | null; // API includes category
  // description?: string | null;
  amount: string;
  dataBundle: string;
  operator: string;
  productId: string;
  category: string;
  validity: string;
}
/*
{
        "responseCode": "00",
        "responseMessage": "Successful Request",
        "dataPlans": [
            {
                "amount": "100",
                "dataBundle": "N100 = 100MB for 1Day",
                "operator": "MTN-DATA",
                "productId": "MTN100MB1Day100",
                "category": "Daily",
                "validity": "Daily"
            },
            
*/
export interface BuyAirtimeRequest {
  transactionPin?: string | null;
  operatorId?: string | null;
  operatorName?: string | null;
  phoneNumber?: string | null;
  amount: number;
  productId?: string | null;
  sourceAccount?: string | null;
  beneficiaryType?: string | null; // 'self' | 'other'
  purchaseType?: string | null; // 'airtime' | 'data' (deprecated, use requestType)
  requestType?: string | null; // 'A' for Airtime, 'D' for Data (new API requirement)
  dataProductId?: string | null; // Required for data purchases (product identifier)
  otp?: string | null;
}

export interface BuyAirtimeResponse {
  responseCode?: string | null;
  responseMessage?: string | null;
  transactionReference?: string | null;
  amount: number;
  phoneNumber?: string | null;
  operatorName?: string | null;
  status?: string | null;
  token?: string | null; // Recharge token for data
}

// ==============================================
// Bills Payment Types
// ==============================================

export interface BillerGroup {
  id?: string | null;
  groupId?: string | null;
  name?: string | null;
  slug?: string | null; // e.g., 'electricity', 'cable-tv'
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
}

export interface Biller {
  id?: string | null;
  billerId?: string | null;
  name?: string | null;
  slug?: string | null;
  code?: string | null;
  groupId?: string | null;
  groupSlug?: string | null;
  shortName?: string | null;
  narration?: string | null;
  customerField?: string | null; // e.g., 'meterNumber', 'smartCardNumber'
  isActive: boolean;
  logoUrl?: string | null;
}

export interface BillerPackage {
  id?: string | null;
  packageId?: string | null;
  billerId?: string | null;
  name?: string | null;
  amount: number;
  description?: string | null;
  validity?: string | null;
  packageType?: string | null; // 'prepaid' | 'postpaid'
  isActive: boolean;
}

// Updated to match swagger: CustomerLookupQuery
export interface CustomerLookupRequest {
  customerId: string; // Required: Customer identifier (e.g., meter number, account number)
  billerSlug: string; // Required: Biller slug identifier (e.g., "IKEDC")
  productName: string; // Required: Product name for the bill payment (e.g., "IKEDC_PREPAID")
}

// Updated to match swagger: CustomerLookupResult (nested in CustomerInfo)
export interface CustomerInfo {
  firstName?: string | null;
  lastName?: string | null;
  customerName?: string | null;
  accountNumber?: string | null;
  customerType?: string | null;
  arrearsBalance?: number | null;
  address?: string | null;
  phoneNumber?: string | null;
  emailAddress?: string | null;
  meterNumber?: string | null;
  canVend?: boolean | null;
}

export interface CustomerLookupResponse {
  responseCode?: string | null;
  responseMessage?: string | null;
  billerName?: string | null;
  customer?: CustomerInfo | null;
  paid?: boolean | null;
  statusCode?: string | null;
  minPayableAmount?: number | null;
  paymentReference?: string | null;
}

// Updated to match swagger: PaymentLookupQuery
export interface PaymentLookupRequest {
  paymentReference: string; // Required: Payment reference to lookup
}

// Updated to match swagger: PaymentLookupResult
export interface PaymentLookupResponse {
  responseCode?: string | null;
  responseMessage?: string | null;
  billerName?: string | null;
  customer?: CustomerInfo | null;
  tokenData?: TokenDataInfo | null;
  paid?: boolean | null;
  paymentReference?: string | null;
  vendStatus?: string | null;
  narration?: string | null;
  statusCode?: string | null;
  amount?: number | null;
  customerMessage?: string | null;
  date?: string | null;
  confirmationTime?: string | null;
}

// Updated to match swagger: BillPaymentRequest
export interface TokenInfo {
  amount?: string | null;
  description?: string | null;
  receiptNumber?: string | null;
  tariff?: string | null;
  tax?: string | null;
  units?: string | null;
  unitsType?: string | null;
  value?: string | null;
}

export interface TokenDataInfo {
  stdToken?: TokenInfo | null;
  bsstToken?: TokenInfo | null;
  resetToken?: string | null;
  configureToken?: string | null;
  kct1?: string | null;
  kct2?: string | null;
}

export interface ProcessPaymentRequest {
  transactionPin?: string | null; // Optional: Transaction PIN for authorization
  paymentReference: string; // Required: Unique payment reference
  customerId: string; // Required: Customer identifier
  packageSlug: string; // Required: Package slug for the bill payment
  amount: string; // Required: Payment amount (note: string, not number!)
  customerName: string; // Required: Customer full name
  phoneNumber?: string | null; // Optional
  email?: string | null; // Optional
  accountNumber: string; // Required: Account number to debit
  otp?: string | null;
}

export interface ProcessPaymentResponse {
  responseCode?: string | null;
  responseMessage?: string | null;
  packageName?: string | null;
  tokenData?: TokenDataInfo | null;
  paid?: boolean | null;
  paymentReference?: string | null;
  transactionId?: string | null;
  vendStatus?: string | null;
  narration?: string | null;
  statusCode?: string | null;
  amount?: number | null;
  convenienceFee?: number | null;
  customerMessage?: string | null;
}

// ==============================================
// EXPENSES API TYPES (from sme_business_swagger.json)
// ==============================================

export type ExpenseCategoryEnum =
  | "Office Supplies"
  | "Utilities"
  | "Marketing"
  | "Travel"
  | "Salaries"
  | "Rent"
  | "Equipment"
  | "Professional Services"
  | "Insurance"
  | "Maintenance"
  | "Others";

export type BeneficiaryTypeEnum =
  | "Account"
  | "Biller"
  | "NotApplicable"
  | "Cash";

export type ExpenseFrequency =
  | "OneTime"
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Custom";

export type ExpenseStatusEnum =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export interface AddExpenseRequest {
  category: ExpenseCategoryEnum;
  beneficiary: BeneficiaryTypeEnum;
  bank?: string | null; // Should be bankCode of beneficiary bank
  accountNumber?: string | null;
  amount: number;
  purpose: string;
  frequency: ExpenseFrequency;
  startDate?: string | null; // ISO date-time string
  endDate?: string | null; // ISO date-time string
  accountToDebit?: string | null; // Account number to debit for the expense
  staffId?: number | null; // ID of the staff member creating the expense
  userId?: number | null; // ID of the user creating the expense
  pin?: string; // Transaction PIN for business owner authorization (lowercase)
  otp?: string | null; // OTP for high-value transaction authorization
}

export interface ExpenseResponse {
  approvedBy: ReactNode;
  approvedDate: string | number | Date;
  rejectedBy: ReactNode;
  rejectedDate: string | number | Date;
  rejectionReason: any;
  id?: number;
  category?: ExpenseCategoryEnum | null;
  beneficiary?: BeneficiaryTypeEnum | null;
  bank?: string | null;
  accountNumber?: string | null;
  amount?: number | null;
  purpose?: string | null;
  frequency?: ExpenseFrequency | null;
  startDate?: string | null;
  endDate?: string | null;
  expenseNumber?: string | null;
  expenseStatus?: ExpenseStatusEnum | null;
  initiator?: string | null;
}

export interface UpdateExpenseRequest {
  expenseStatus: ExpenseStatusEnum; // "Approved" or "Rejected"
  pin?: string; // Transaction PIN for authorization (4 digits)
  otp?: string | null; // OTP for high-value transaction authorization
  rejectionReason?: string; // Reason for rejecting the expense
}

export interface ExpenseResponseResult {
  status?: string | null;
  message?: string | null;
  data?: ExpenseResponse | null;
  errors?: Record<string, string[]> | null;
}

export interface ExpensesListResponse {
  status?: string | null;
  message?: string | null;
  data?: ExpenseResponse[] | null;
  errors?: Record<string, string[]> | null;
}

// ==============================================
// Response Wrapper Types
// ==============================================

// export type LoginApiResponse = ApiResponse<LoginResponseWrapper>;
export type BvnApiResponse = ApiResponse<BvnResponse>;
export type StaffCredentialsApiResponse = ApiResponse<StaffCredentials>;
export type StaffListApiResponse = ApiResponse<StaffListItem[]>;
export type BooleanApiResponse = ApiResponse<boolean>;

export type BanksListApiResponse = ApiResponse<Bank[]>;
export type NameEnquiryApiResponse = ApiResponse<NameEnquiryResponse>;
export type FundsTransferApiResponse = ApiResponse<FundsTransferResponse>;
// ==============================================
// Invoice Management Types
// ==============================================

export enum InvoiceStatusEnum {
  Draft = 1,
  Sent = 2,
}

export interface AddInvoiceDetailRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceRequest {
  customerName: string;
  customerPhoneNumber: string;
  customerDeliveryAddress: string;
  customerEmailAddress: string;
  note?: string | null;
  dueDate?: string | null; // ISO date-time string
  invoiceStatus?: InvoiceStatusEnum;
  subTotal: number;
  total?: number;
  invoiceNumber: string;
  taxRate: number;
  invoiceDetailRequest?: AddInvoiceDetailRequest[] | null;
}

export interface SendInvoiceRequest {
  method?: string | null;
  recipientEmail?: string | null;
}

export interface InvoiceResponse {
  id: number;
  createdAt: string;
  updatedAt?: string | null;
  customerName: string;
  customerPhoneNumber: string;
  customerDeliveryAddress: string;
  customerEmailAddress: string;
  note?: string | null;
  dueDate?: string | null;
  invoiceStatus?: InvoiceStatusEnum;
  invoiceAmount?: number;
  invoiceNumber: string;
  invoiceLink?: string | null;
  invoiceDetails?:
    | {
        $id?: string;
        $values?: Array<{
          id: number;
          productId: number;
          quantity: number;
          unitPrice: number;
          productName?: string;
          isVatable?: boolean;
          isVatApplied?: boolean;
        }>;
      }
    | Array<{
        id: number;
        productId: number;
        quantity: number;
        unitPrice: number;
        productName?: string;
        isVatable?: boolean;
        isVatApplied?: boolean;
      }>
    | null;
  // Legacy fields (kept for backward compatibility)
  createdOn?: string;
  subTotal?: number;
  total?: number;
  taxRate?: number;
  invoiceDetailResponse?: AddInvoiceDetailRequest[] | null;
}

export type TransactionStatusApiResponse =
  ApiResponse<TransactionStatusResponse>;
export type TransactionHistoryApiResponse =
  ApiResponse<TransactionHistoryResult>;
export type AccountStatementApiResponse = ApiResponse<AccountStatementResult>;

export type CategoryApiResponse = ApiResponse<CreateCategoryRequest>;
export type StoreApiResponse = ApiResponse<CreateStoreRequest>;
export type OrderApiResponse = ApiResponse<OrderResponse>;
export type OrderLinkApiResponse = ApiResponse<OrderLinkResponse>;
export type ProductApiResponse = ApiResponse<CreateProductRequest>;
export type SellApiResponse = ApiResponse<SellResponse>;
export type InvoiceApiResponse = ApiResponse<InvoiceResponse>;

// Additional response types for arrays
export type CategoriesListApiResponse = ApiResponse<CreateCategoryRequest[]>;
export type StoresListApiResponse = ApiResponse<CreateStoreRequest[]>;
export type OrdersListApiResponse = ApiResponse<OrderResponse[]>;
export type ProductsListApiResponse = ApiResponse<CreateProductRequest[]>;
export type SellsListApiResponse = ApiResponse<SellResponse[]>;
export type InvoicesListApiResponse = ApiResponse<InvoiceResponse[]>;

// Bulk transfer response types
export type BulkTransferApiResponse = ApiResponse<BulkTransferResponse>;
export type BulkIntrabankTransferApiResponse =
  ApiResponse<BulkTransferResponse>;
export type BulkTransferCsvApiResponse = ApiResponse<BulkTransferCsvResponse>;
export type CsvFormatApiResponse = ApiResponse<CsvFormat>;

// Airtime & Data response types
export type OperatorsListApiResponse = ApiResponse<Operator[]>;
export type OperatorProductsListApiResponse = ApiResponse<OperatorProduct[]>;
export type DataProductsListApiResponse = ApiResponse<DataProduct[]>;
export type BuyAirtimeApiResponse = ApiResponse<BuyAirtimeResponse>;

// Bills payment response types
export type BillerGroupsListApiResponse = ApiResponse<BillerGroup[]>;
export type BillersListApiResponse = ApiResponse<Biller[]>;
export type BillerPackagesListApiResponse = ApiResponse<BillerPackage[]>;
export type CustomerLookupApiResponse = ApiResponse<CustomerLookupResponse>;
export type PaymentLookupApiResponse = ApiResponse<PaymentLookupResponse>;
export type ProcessPaymentApiResponse = ApiResponse<ProcessPaymentResponse>;

// ==============================================
// Transaction Limits Types
// ==============================================

/**
 * Transaction limits configuration from GET /TransactionLimits
 * Contains maximum limits for different transaction types
 */
export interface TransactionLimitsResponse {
  cumulativeDailyLimit: number; // Maximum total amount per day (e.g., ₦250,000,000)
  singleTransactionLimit: number; // Maximum amount per single transaction (e.g., ₦100,000,000)
  pinTransactionLimit: number; // Maximum amount for PIN-based transactions
  tokenTransactionLimit: number; // Maximum amount for token-based transactions
}

/**
 * Daily transaction usage from GET /TransactionLimits/DailyUsage
 * Shows how much of the daily limit has been used
 */
export interface DailyUsageResponse {
  //---------- Recently added
  limit: number;
  amountUsedToday: number;

  //----------
  date: string; // ISO date-time string of the usage date
  totalTransacted: number; // Total amount transacted today
  dailyLimit: number; // Daily limit (should match cumulativeDailyLimit)
  remaining: number; // Remaining amount available for today (dailyLimit - totalTransacted)
  percentageUsed: number; // Percentage of daily limit used (0-100)
}

// Response wrapper types
export type TransactionLimitsApiResponse =
  ApiResponse<TransactionLimitsResponse>;
export type DailyUsageApiResponse = ApiResponse<DailyUsageResponse>;

// Forgot Password response wrapper types
export type GenerateOTPByUsernameApiResponse = ApiResponse<string>; // Returns recipientId as string
export type ValidateOTPForgotPasswordApiResponse = ApiResponse<boolean>; // Returns true/false
export type ForgotPasswordApiResponse = ApiResponse<ForgotPasswordResponse>;
export type ResetPasswordApiResponse = ApiResponse<ResetPasswordResponse>;

// ==============================================
// Refund Types
// ==============================================

/**
 * Business owner refund request
 * @endpoint PATCH /Orders/BusinessOwner/Refund/{id}
 */
export interface BusinessOwnerRefundRequest {
  category: string;
  beneficiary: string;
  bank: string;
  accountNumber: string;
  amount: number;
  purpose: string;
  frequency: string;
  startDate: string;
  staffId: number;
  accountToDebit: string;
  userId: number;
  pin: string;
}

/**
 * Staff refund request
 * @endpoint PATCH /Orders/Staff/Refund/{id}
 */
export interface StaffRefundRequest {
  category: string;
  beneficiary: string;
  bank: string;
  accountNumber: string;
  amount: number;
  purpose: string;
  frequency: string;
  startDate: string;
  staffId: number;
  accountToDebit: string;
  userId: number;
}

/**
 * Complete refund request
 * @endpoint PATCH /Orders/CloseRefund/{id}
 */
export interface CompleteRefundRequest {
  bank: string;
  accountNumber: string;
  amount: number;
  purpose: string;
  frequency: string;
  startDate: string;
  staffId: number;
  accountToDebit: string;
  userId: number;
  pin: string;
}

// Response wrapper types for refunds
export type BusinessOwnerRefundApiResponse = ApiResponse<any>;
export type StaffRefundApiResponse = ApiResponse<any>;
export type CompleteRefundApiResponse = ApiResponse<any>;

// ==============================================
// Analytics Types
// ==============================================

/**
 * Analytics request payload
 * @endpoint POST /Analytics
 */
export interface AnalyticsRequest {
  startDate: string; // ISO date-time string (e.g., "2025-10-01T07:57:45.936Z")
  endDate: string; // ISO date-time string (e.g., "2025-12-10T07:57:45.936Z")
  requestedQuantity: number; // Number of top items to return (e.g., 10)
  byRevenue: boolean; // Sort by revenue (true) or quantity sold (false)
}

/**
 * Analytics item - represents a product or category with sales data
 */
export interface AnalyticsItem {
  productId: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  totalQuantity: number;
  totalRevenue: number;
}

// Response wrapper type for analytics
export type AnalyticsApiResponse = ApiResponse<AnalyticsItem[]>;
