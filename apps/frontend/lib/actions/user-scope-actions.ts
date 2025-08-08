"use server";

import { revalidatePath } from "next/cache";
import { userService } from "@/lib/api/services";
import { UserScopeWithRelations } from "../api/types";
import { api } from "../api/api";

export async function getFacilityUserScopes(facilityId: string) {
  try {
    const response = await api<UserScopeWithRelations[]>(`/facility/${facilityId}/user-scopes`);
    return { success: true, data: response?.data || [] };
  } catch (error) {
    console.error("Error fetching facility user scopes:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function getVenueUserScopes(venueId: string) {
  try {
    const response = await api<UserScopeWithRelations[]>(`/venue/${venueId}/user-scopes`);
    return { success: true, data: response?.data || [] };
  } catch (error) {
    console.error("Error fetching venue user scopes:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function addFacilityModerator(
  facilityId: string,
  data: { userId: string; role: "moderator" | "owner" }
) {
  try {
    await api(`/facility/${facilityId}/user-scope`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath(`/dashboard/user-scopes/facilities/${facilityId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding facility moderator:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function addVenueModerator(
  facilityId: string,
  venueId: string,
  data: { userId: string }
) {
  try {
    await api(`/facility/${facilityId}/venue/${venueId}/user-scope`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath(`/dashboard/user-scopes/venues/${venueId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding venue moderator:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function removeFacilityModerator(facilityId: string, userId: string) {
  try {
    await api(`/facility/${facilityId}/user-scope/${userId}`, {
      method: 'DELETE',
    });
    revalidatePath(`/dashboard/user-scopes/facilities/${facilityId}`);
    return { success: true };
  } catch (error) {
    console.error("Error removing facility moderator:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function removeVenueModerator(
  facilityId: string,
  venueId: string,
  userId: string
) {
  try {
    await api(`/facility/${facilityId}/venue/${venueId}/user-scope/${userId}`, {
      method: 'DELETE',
    });
    revalidatePath(`/dashboard/user-scopes/venues/${venueId}`);
    return { success: true };
  } catch (error) {
    console.error("Error removing venue moderator:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function searchUsers(searchQuery: string) {
  try {
    if (!searchQuery.trim()) {
      return { success: true, data: [] };
    }
    
    const users = await userService.searchUsers(searchQuery);
    return { success: true, data: users };
  } catch (error) {
    console.error("Error searching users:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
