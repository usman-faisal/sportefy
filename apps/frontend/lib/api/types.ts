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
} from "@sportefy/db-types";

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
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface CreateMediaDto {
  url: string;
  type: string;
}


export interface UserScopeWithFacilityAndVenue extends UserScope {
  facility?: Facility;
  venue?: Venue;
}
export interface ProfileWithScopes extends Profile {
  userScopes?: UserScopeWithFacilityAndVenue[];
}