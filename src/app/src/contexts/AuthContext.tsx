import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthState, RegistrationData, ProfileData } from '../types/auth.types';
import { type StaffData } from '../types/user.types';
import { type UserRole } from '../types/common.types';
import { removeUserData, saveUserData } from '../stores/storage';
// import { saveUserData, removeUserData } from '../../services/storage';

interface AuthContextType extends AuthState {
  // State setters
  setIsAuthenticated: (value: boolean) => void;
  setUserRole: (role: UserRole) => void;
  setStaffData: (data: StaffData | null) => void;
  setCurrentKYCTier: (tier: number) => void;
  setHasSetupPassword: (value: boolean) => void;
  setIsFirstLogin: (value: boolean) => void;
  setBusinessType: (type: 'registered' | 'unregistered' | null) => void;
  setRegistrationData: React.Dispatch<React.SetStateAction<RegistrationData>>;
  
  // Temporary profile data for OTP verification
  tempProfileData: ProfileData | null;
  setTempProfileData: (data: ProfileData | null) => void;
  
  // Profile photo state
  profilePhoto: string | null;
  setProfilePhoto: (photo: string | null) => void;
  
  // Auth actions
  login: (role: UserRole, staffData: StaffData, kycTier?: number) => void;
  logout: () => void;
  updateKYCTier: (tier: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [currentKYCTier, setCurrentKYCTier] = useState(1);
  const [hasSetupPassword, setHasSetupPassword] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [businessType, setBusinessType] = useState<'registered' | 'unregistered' | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({});
  const [tempProfileData, setTempProfileData] = useState<ProfileData | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const login = (role: UserRole, data: StaffData, kycTier: number = 1) => {
    setUserRole(role);
    setStaffData(data);
    setCurrentKYCTier(kycTier);
    setIsAuthenticated(true);

    // Cache to localStorage
    const userData = {
      role,
      staffData: data,
      kycTier,
      accessCode: data.employeeId
    };
    saveUserData(userData);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setStaffData(null);
    setUserRole('user');
    setCurrentKYCTier(1);
    setHasSetupPassword(false);
    setIsFirstLogin(false);
    setBusinessType(null);
    setRegistrationData({});
    removeUserData();
  };

  const updateKYCTier = (tier: number) => {
    setCurrentKYCTier(tier);
    if (staffData) {
      const userData = {
        role: userRole,
        staffData,
        kycTier: tier,
        accessCode: staffData.employeeId
      };
      saveUserData(userData);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        staffData,
        currentKYCTier,
        hasSetupPassword,
        isFirstLogin,
        businessType,
        registrationData,
        tempProfileData,
        profilePhoto,
        setIsAuthenticated,
        setUserRole,
        setStaffData,
        setCurrentKYCTier,
        setHasSetupPassword,
        setIsFirstLogin,
        setBusinessType,
        setRegistrationData,
        setTempProfileData,
        setProfilePhoto,
        login,
        logout,
        updateKYCTier
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
