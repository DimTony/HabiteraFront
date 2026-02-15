import { type UserRole } from "./common.types";
import { type StaffData } from "./user.types";

export interface RegistrationData {
  identity?: any;
  business?: any;
  account?: any;
  password?: any;
  pin?: any;
}

export interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole;
  staffData: StaffData | null;
  currentKYCTier: number;
  hasSetupPassword: boolean;
  isFirstLogin: boolean;
  businessType: "registered" | "unregistered" | null;
  registrationData: RegistrationData;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  accountNumber: string;
}
