"use server";

import { revalidatePath } from "next/cache";
import { api, apiPaginated, PaginatedResponse } from "@/lib/api/api";
import { Profile, User } from "@sportefy/db-types";


export async function searchUsersByEmail(
  emailQuery: string
): Promise<PaginatedResponse<Profile[]> | null> {
  if (!emailQuery || emailQuery.trim().length < 2) {
    return null;
  }

  try {
    const users = await apiPaginated<Profile[]>("/admin/users", {
      search: emailQuery,
      limit: 10,
    });
    return users;
  } catch (error) {
    console.error("Failed to search for users:", error);
    return null;
  }
}

export async function setUserBlockedStatus(userId: string, isBlocked: boolean) {
  try {
    const response = await api<Profile>(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isBlocked }),
    });

    if (!response?.success) {
      throw new Error(response?.message || "Failed to update user status");
    }

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user status:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}