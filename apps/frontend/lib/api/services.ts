import { Profile } from "@sportefy/db-types";
import { api, apiPaginated, PaginatedResponse } from "./api";
import {
  BookingOverview,
  UserScopeWithVenue,
  ProfileWithDetails,
  FacilityWithRelations,
  FacilityDetails,
  UpdateFacilityDto,
  CreateFacilityDto,
  ProfileWithScopes,
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
  
  getProfileWithScopes: async (): Promise<ProfileWithScopes | null> => {
    const response = await api<ProfileWithScopes>("/profile/me-with-scopes");
    return response?.data || null;
  }
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


export const facilityService = {
  getAllFacilities: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FacilityWithRelations> | null> => {
    const response = await apiPaginated<FacilityWithRelations>("/facilities", params);
    return response || null;
  },

  getFacility: async (facilityId: string): Promise<FacilityDetails | null> => {
    const response = await api<FacilityDetails>(`/facilities/${facilityId}`);
    return response?.data || null;
  },

  createFacility: async (
    createData: CreateFacilityDto
  ): Promise<FacilityDetails | null> => {
    const response = await api<FacilityDetails>(
      "/facilities", 
      {
        method: 'POST',
        body: JSON.stringify(createData),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response?.data || null;
  },

  updateFacility: async (
    facilityId: string, 
    updateData: UpdateFacilityDto
  ): Promise<FacilityDetails | null> => {
    const response = await api<FacilityDetails>(
      `/facilities/${facilityId}`, 
      {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response?.data || null;
  },

  deleteFacility: async (facilityId: string): Promise<boolean> => {
    const response = await api<{ message: string }>(
      `/facilities/${facilityId}`, 
      {
        method: 'DELETE',
      }
    );
    return response?.success || false;
  },

}