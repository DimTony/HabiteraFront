export interface AgentFormData {
  firstName: string;
  lastName: string;
  licenseNumber: string;
  agencyName: string;
  phoneNumber: string;
  city: string;
  state: string;
  country: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  preferredLanguage: string;
}