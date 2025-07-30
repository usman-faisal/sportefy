import { Profile } from "@sportefy/db-types";
import { api } from "./api";
import { UserScopeWithVenue } from "./types";

export const userScopeService = {
  getMyUserScopes: async (): Promise<UserScopeWithVenue[]> => {
    const response = await api<UserScopeWithVenue[]>("/user-scope/my-scopes");
    return response?.data || [];
  },
};
export const profileService = {
  getProfile: async (): Promise<Profile | null> => {
    const response = await api<Profile>("/profile/me");
    return response;
  },
};

export interface BookingOverview {
  coutId: string;
  courtName: string;
  bookedSlots: number;
  availableSlots: number;
  occupancyRate: number;
  revenue: number;
  noShows: number;
}

export const bookingService = {
  getDailyBookingOverview: async (date: Date): Promise<BookingOverview[]> => {
    const response = await api<BookingOverview[]>(
      `/admin/booking-overview?date=${date.toISOString()}`
    );
    return response?.data || [];
  },
};
