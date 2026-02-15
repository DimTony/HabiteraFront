import { type UserRole } from './common.types';

export interface StaffData {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  employeeId: string;
  status: 'active' | 'inactive';
  role: UserRole;
  accessCode?: string;
  username?: string;
  tempPassword?: string;
  permissions?: StaffPermissions;
}

export interface StaffPermissions {
  // Basic Staff Permissions
  acceptPayments: boolean;
  viewReports: boolean;
  manageInventory: boolean;
  processOrders: boolean;
  viewCustomers: boolean;
  manageExpenses: boolean;
  // Business Owner-only Permissions
  approvePayroll?: boolean;
  createStaff?: boolean;
  approveExpenses?: boolean;
  addInventory?: boolean;
  createCategory?: boolean;
  manageBulkPayments?: boolean;
  viewAnalytics?: boolean;
  manageStaffPermissions?: boolean;
  approveTransactions?: boolean;
  exportData?: boolean;
}
