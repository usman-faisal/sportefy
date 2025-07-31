import { Profile } from "@sportefy/db-types";
import { api, apiPaginated, PaginatedResponse } from "./api";
import {
  BookingOverview,
  UserScopeWithVenue,
  BookingOverviewResponse,
  ProfileWithDetails,
} from "./types";

export const userScopeService = {
  getMyUserScopes: async (): Promise<UserScopeWithVenue[]> => {
    const response = await api<UserScopeWithVenue[]>("/user-scope/my-scopes");
    return response?.data || [];
  },
};
export const profileService = {
  getProfile: async (): Promise<Profile | null> => {
    const response = await api<Profile>("/profile/me");
    return response?.data || null;
  },
};

export const bookingService = {
  getDailyBookingOverview: async (
    date: Date,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<BookingOverview> | null> => {
    const params = new URLSearchParams({
      date: date.toISOString(),
    });

    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const response = await apiPaginated<BookingOverview>(
      `/admin/booking-overview?${params.toString()}`
    );

    return response || null;
  },
};

export const userService = {
  getAllUsers: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Profile> | null> => {
    const response = await apiPaginated<Profile>("/admin/users", params);
    return response || null;
  },

  getUserDetails: async (
    userId: string
  ): Promise<ProfileWithDetails | null> => {
    const response = await api<Profile>(`/admin/users/${userId}`);
    return response?.data || null;
  },
};
