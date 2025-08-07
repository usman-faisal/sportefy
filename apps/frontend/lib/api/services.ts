import { Media, OperatingHour, Profile, Sport, Venue } from "@sportefy/db-types";
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
  CreateOperatingHourDto,
} from "./types";
import { CreateVenueDto, UpdateVenueDto, VenueDetails } from "./types";
import { Scope } from "../types";

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

export const sportService = {
  getAllSports: async (): Promise<Sport[]> => {
    const response = await api<Sport[]>("/sports");
    return response?.data || [];
  },
}
export const userService = {
  getAllUsers: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Profile> | null> => {
    const response = await apiPaginated<Profile>("/admin/users", params);
    return response || null;
  },

  searchUsers: async (search: string): Promise<Profile[]> => {
    const response = await apiPaginated<Profile>("/admin/users", {
      search,
      limit: 10,
    });
    return response?.data || [];
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
    name?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FacilityWithRelations> | null> => {
    const response = await apiPaginated<FacilityWithRelations>(
      "/facilities",
      params
    );
    return response || null;
  },

  getFacility: async (facilityId: string): Promise<FacilityDetails | null> => {
    console.log(facilityId, "facility id in getfaciltiy");
    const response = await api<FacilityDetails>(`/facilities/${facilityId}`);
    return response?.data || null;
  },

  createFacility: async (
    createData: CreateFacilityDto
  ): Promise<FacilityDetails | null> => {
    const response = await api<FacilityDetails>("/facilities", {
      method: "POST",
      body: JSON.stringify(createData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response?.data || null;
  },

  updateFacility: async (
    facilityId: string,
    updateData: UpdateFacilityDto
  ): Promise<FacilityDetails | null> => {
    const response = await api<FacilityDetails>(`/facilities/${facilityId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response?.data || null;
  },

  deleteFacility: async (facilityId: string): Promise<boolean> => {
    const response = await api<{ message: string }>(
      `/facilities/${facilityId}`,
      {
        method: "DELETE",
      }
    );
    return response?.success || false;
  },
};

export const operatingHourService = {
  getOperatingHours: async (
    scopeId: string,
    scope: Scope
  ): Promise<OperatingHour[] | null> => {
    const response = await api<OperatingHour[]>(
      `/${scope}/${scopeId}/operating-hours`
    );
    return response?.data || [];
  },
  addOperatingHour: async (
    scopeId: string,
    scope: Scope,
    data: CreateOperatingHourDto
  ) => {
    const response = await api(`/${scope}/${scopeId}/operating-hours`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return response?.data;
  },
  addOperatingHoursBulk: async (
    scopeId: string,
    scope: Scope,
    data: CreateOperatingHourDto[]
  ) => {
    const response = await api(`/${scope}/${scopeId}/operating-hours/bulk`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return response?.data;
  },
  updateOperatingHour: async (
    scopeId: string,
    scope: Scope,
    hourId: number,
    data: Partial<Omit<CreateOperatingHourDto, "id">>
  ) => {
    const response = await api(
      `/${scope}/${scopeId}/operating-hours/${hourId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }
    );
    return response?.data;
  },
  deleteOperatingHour: async (
    scopeId: string,
    scope: Scope,
    hourId: number
  ) => {
    const response = await api(
      `/${scope}/${scopeId}/operating-hours/${hourId}`,
      {
        method: "DELETE",
      }
    );
    return response?.success || false;
  },
  deleteAllOperatingHours: async (scopeId: string, scope: Scope) => {
    const response = await api(`/${scope}/${scopeId}/operating-hours`, {
      method: "DELETE",
    });
    return response?.success || false;
  },
};

export const facilityMediaService = {
  getMedia: async (scopeId: string, scope: Scope): Promise<Media[] | null> => {
    const response = await api<Media[]>(`/${scope}/${scopeId}/media`);
    return response?.data || null;
  },
  addMedia: async (scopeId: string, scope: Scope, data: any) => {
    const response = await api(`/${scope}/${scopeId}/media`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return response?.data;
  },
  addMediaBulk: async (scopeId: string, scope: Scope, data: any[]) => {
    const response = await api(`/${scope}/${scopeId}/media/bulk`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return response?.data;
  },
  deleteMedia: async (scopeId: string, scope: Scope, mediaId: string) => {
    const response = await api(`/${scope}/${scopeId}/media/${mediaId}`, {
      method: "DELETE",
    });
    return response?.success || false;
  },
  deleteAllMedia: async (scopeId: string, scope: Scope) => {
    const response = await api(`/${scope}/${scopeId}/media`, {
      method: "DELETE",
    });
    return response?.success || false;
  },
};


export const venueService = {
  getAllVenues: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    facilityId?: string;
  }): Promise<PaginatedResponse<Venue> | null> => {
    const response = await apiPaginated<Venue>("/venues", params);
    return response || null;
  },

  getVenue: async (venueId: string): Promise<VenueDetails | null> => {
    const response = await api<VenueDetails>(`/venues/${venueId}`);
    return response?.data || null;
  },

  createVenue: async (
    facilityId: string,
    createData: CreateVenueDto
  ): Promise<Venue | null> => {
    const response = await api<Venue>(`/facility/${facilityId}/venues`, {
      method: "POST",
      body: JSON.stringify(createData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response?.data || null;
  },

  updateVenue: async (
    facilityId: string,
    venueId: string,
    updateData: UpdateVenueDto
  ): Promise<Venue | null> => {
    const response = await api<Venue>(`/facility/${facilityId}/venues/${venueId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response?.data || null;
  },

  deleteVenue: async (facilityId: string, venueId: string): Promise<boolean> => {
    const response = await api<{ message: string }>(`/facility/${facilityId}/venues/${venueId}`, {
      method: "DELETE",
    });
    return response?.success || false;
  },
};
