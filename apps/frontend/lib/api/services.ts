import {
  Booking,
  Media,
  OperatingHour,
  Payment,
  Profile,
  Sport,
  Transaction,
  Venue,
  MaintenanceSchedule,
} from "@sportefy/db-types";
import { api, apiPaginated, PaginatedResponse } from "./api";
import {
  BookingOverview,
  UserScopeWithRelations,
  ProfileWithDetails,
  FacilityWithRelations,
  FacilityDetails,
  UpdateFacilityDto,
  CreateFacilityDto,
  ProfileWithScopes,
  CreateOperatingHourDto,
  BookingStats,
  BookingWithRelations,
  BookingDetails,
  VerifyPaymentDto,
  PaymentWithUser,
  DashboardReport,
  MaintenanceScheduleWithRelations,
  CreateMaintenanceScheduleDto,
  UpdateMaintenanceScheduleDto,
} from "./types";
import { CreateVenueDto, UpdateVenueDto, VenueDetails } from "./types";
import { Scope, ScopeRole } from "../types";

export const userScopeService = {
  getMyUserScopes: async (): Promise<UserScopeWithRelations[]> => {
    const response = await api<UserScopeWithRelations[]>("/user-scope/my-scopes");
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
  getAllBookings: async (params?: {
    page?: number;
    limit?: number;
    venueId?: string;
    status?: string;
  }): Promise<PaginatedResponse<BookingWithRelations> | null> => {
    const response = await apiPaginated<BookingWithRelations>(
      "/bookings/all",
      params
    );
    return response || null;
  },

  getBookingStats: async (): Promise<BookingStats | null> => {
    const response = await api<BookingStats>("/bookings/stats");
    return response?.data || null;
  },
  getBookingDetails: async (
    bookingId: string
  ): Promise<BookingDetails | null> => {
    const response = await api<BookingDetails>(`/bookings/${bookingId}`);
    return response?.data || null;
  },
};

export const sportService = {
  getAllSports: async (): Promise<Sport[]> => {
    const response = await api<Sport[]>("/sports");
    return response?.data || [];
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
    const response = await api<Venue>(
      `/facility/${facilityId}/venues/${venueId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response?.data || null;
  },

  deleteVenue: async (
    facilityId: string,
    venueId: string
  ): Promise<boolean> => {
    const response = await api<{ message: string }>(
      `/facility/${facilityId}/venues/${venueId}`,
      {
        method: "DELETE",
      }
    );
    return response?.success || false;
  },
};

export const paymentService = {
  getPendingPayments: async (): Promise<PaymentWithUser[] | null> => {
    const response = await api<PaymentWithUser[]>("/payments/pending");
    return response?.data || null;
  },

  verifyPayment: async (
    paymentId: string,
    data: VerifyPaymentDto
  ): Promise<boolean> => {
    const response = await api(`/payments/${paymentId}/verify`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response?.success || false;
  },

  getUserTransactions: async (
    userId: string
  ): Promise<Transaction[] | null> => {
    const response = await api<Transaction[]>(
      `/payments/user/${userId}/history`
    );
    return response?.data || [];
  },
};

export const reportService = {
  getDashboardReports: async (): Promise<DashboardReport | null> => {
    const response = await api<DashboardReport>("/reports/dashboard");
    return response?.data || null;
  },
};

export const maintenanceScheduleService = {
  getMaintenanceSchedules: async (
    venueId: string
  ): Promise<MaintenanceScheduleWithRelations[]> => {
    const response = await api<MaintenanceScheduleWithRelations[]>(
      `/venues/${venueId}/maintenance-schedules`
    );
    return response?.data || [];
  },

  createMaintenanceSchedule: async (
    venueId: string,
    createData: CreateMaintenanceScheduleDto
  ): Promise<MaintenanceSchedule | null> => {
    const response = await api<MaintenanceSchedule>(
      `/venues/${venueId}/maintenance-schedules`,
      {
        method: "POST",
        body: JSON.stringify(createData),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response?.data || null;
  },

  updateMaintenanceSchedule: async (
    venueId: string,
    maintenanceId: string,
    updateData: UpdateMaintenanceScheduleDto
  ): Promise<MaintenanceSchedule | null> => {
    const response = await api<MaintenanceSchedule>(
      `/venues/${venueId}/maintenance-schedules/${maintenanceId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response?.data || null;
  },

  deleteMaintenanceSchedule: async (
    venueId: string,
    maintenanceId: string
  ): Promise<boolean> => {
    const response = await api<{ message: string }>(
      `/venues/${venueId}/maintenance-schedules/${maintenanceId}`,
      {
        method: "DELETE",
      }
    );
    return response?.success || false;
  },
};


