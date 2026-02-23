export interface ApiResponse<T = any> {
  status: string | null;
  message: string | null;
  data: T;
}

export interface NewListingFormData {
  firstName: string;
  lastName: string;
  licenseNumber: string;
  agencyName: string;
  phoneNumber: string;
  city: string;
  state: string;
  country: string;
}

export interface PropertySearchRequest {
  query?: string;
  city?: string;
  state?: string;
  country?: string;
  geoSearch?: {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    boundingBox?: {
      topLeftLat: number;
      topLeftLon: number;
      bottomRightLat: number;
      bottomRightLon: number;
    };
  };
  propertyTypes?: string[];
  listingTypes?: string[];
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  amenities?: string[];
  statuses?: string[];
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
  status?: "Active" | "UnderReview" | "Inactive";
  agentId?: string;
}


export interface ListingResult {
  responseCode?: string | null;
  responseMessage?: string | null;
  transactions?: any[] | null;
  totalCount?: number | null;
  items?: any[] | null;
  accountNumber?: string | null;
  availableBalance?: string | null;
  clearedBalance?: string | null;
  openingBalance?: string | null;
  closingBalance?: string | null;
}

export type ListingApiResponse = ApiResponse<ListingResult>;
