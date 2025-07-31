import {
  Booking,
  User,
  UserScope,
  Venue,
  Profile,
  Match,
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

export interface BookingOverviewResponse {
  summary?: BookingSummary;
  courts?: {
    data: BookingOverview[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
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
