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
  Payment,
} from "@sportefy/db-types";
import { DayOfWeek, MediaType } from "../types";

export interface UserScopeWithRelations extends UserScope {
  profile: Profile;
  venue?: Venue;
  facility?: Facility;
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

export interface BookingDetails {
  booking: Booking;
  slot: Slot;
  match: Match | null;
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
  availability?: 'active' | 'inactive' | 'maintenance';
  operatingHours: CreateOperatingHourDto[];
  media: CreateMediaDto[];
}

export interface UpdateVenueDto {
  name?: string;
  sportIds?: string[];
  basePrice?: number;
  capacity?: number;
  availability?: 'active' | 'inactive' | 'maintenance';
}

export interface VenueDetails extends Venue {
  facility: Facility;
  sports: Sport[];
  operatingHours: OperatingHour[];
  bookings: BookingWithRelations[];
}

export interface BookingStats {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
}
export interface VerifyPaymentDto {
  status: "verified" | "rejected";
  rejectionReason?: string;
}

export interface PaymentWithUser extends Payment {
  user: Profile;
}

export interface BookingTrendPoint {
  date: string;
  count: number;
}

export interface PopularTimeSlot {
  time: string;
  bookings: number;
}

export interface DashboardReport {
  summary: {
    dailyRevenue: number;
  };
  bookingTrends: BookingTrendPoint[];
  popularTimeSlots: PopularTimeSlot[];
}
