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
  search?: string;
}

export interface Listing {
  id: string;

  agentId: string;
  agentName: string;

  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  status: string;

  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  fullAddress: string;
  location: {
    lat: number;
    lng: number;
  } | null;

  price: number;
  currency: string;
  pricePerSquareFoot: number;
  tenor: string;

  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize: number;
  yearBuilt: number;

  images: string[];
  primaryImageUrl: string | null;

  amenities: string[];
  amenityTags: string[];
  amenitiesData: Record<string, any>;

  viewCount: number;
  favoriteCount: number;
  isFavorited: boolean;
  isFeatured: boolean;

  isPublished: boolean;
  daysOnMarket: number;
  publishedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ListingResult {
  data: Listing[];
  error: any[] | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  message: string;
  pageNumber: number;
  pageSize: number;
  statusCode: number;
  success: boolean;
  totalPages: number;
  totalRecords: number;
}

export type ListingApiResponse = ApiResponse<ListingResult>;
