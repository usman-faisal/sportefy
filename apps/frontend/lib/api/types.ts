import {
  Booking,
  User,
  UserScope,
  Venue,
  Profile,
  Match,
  Sport,
  Facility,
  OperatingHour,
  Media,
  Slot,
} from "@sportefy/db-types";
import { DayOfWeek, MediaType } from "../types";

export interface UserScopeWithVenue extends UserScope {
  venue: Venue;
}

export interface BookingOverview {
  courtId: string;
  courtName: string;
  bookedSlots: number;
  availableSlots: number;
  occupancyRate: number;
  revenue: number;
  noShows: number;
}

export interface BookingSummary {
  date: string;
  totalRevenue: number;
  totalBookings: number;
  totalNoShows: number;
  overallOccupancyRate: number;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BookingOverviewResponse {
  summary?: BookingSummary;
  courts?: {
    data: BookingOverview[];
    pagination: PaginationData;
  };
}

export interface UserWithBookings extends User {
  bookings: Booking[];
}

export interface BookingWithRelations extends Booking {
  venue?: Venue;
  match?: Match;
  slots: Slot[];
  bookedByProfile?: Profile;
}

export interface ProfileWithDetails extends Profile {
  bookings?: BookingWithRelations[];
}

export interface VenueWithRelations extends Venue {
  sports: Sport[];
}

export interface FacilityWithRelations extends Facility {
  venue: VenueWithRelations;
}

export interface OwnerWithProfile extends Profile {
  profile: Profile;
}

export interface FacilityDetails extends Facility {
  venue: Venue;
  operatingHours: OperatingHour[];
  owner: OwnerWithProfile;
  media: Media[];
}

export interface UpdateFacilityDto {
  name?: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
}

export interface CreateFacilityDto {
  name: string;
  ownerId: string;
  description: string;
  phoneNumber: string;
  address: string;
  operatingHours: CreateOperatingHourDto[];
  media: CreateMediaDto[];
}

export interface CreateOperatingHourDto {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
}

export interface CreateMediaDto {
  mediaLink: string;
  mediaType: MediaType;
}

export interface UserScopeWithFacilityAndVenue extends UserScope {
  facility?: Facility;
  venue?: Venue;
}
export interface ProfileWithScopes extends Profile {
  userScopes?: UserScopeWithFacilityAndVenue[];
}


export interface CreateVenueDto {
  name: string;
  sportIds: string[];
  basePrice: number;
  capacity: number;
  operatingHours: CreateOperatingHourDto[];
  media: CreateMediaDto[];
}

export interface UpdateVenueDto {
  name?: string;
  sportIds?: string[];  // Fixed: backend expects 'sportIds' not 'sports'
  basePrice?: number;   // Fixed: backend expects 'basePrice' not 'base_price'  
  capacity?: number;
  // Note: operatingHours and media are handled separately via different endpoints
}

export interface VenueDetails extends Venue {
  facility: Facility;
  sports: Sport[];
  operatingHours: OperatingHour[];
  bookings: Booking[];
}

export interface BookingStats {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
}
