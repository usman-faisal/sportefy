"use server";

import { apiPaginated, PaginatedResponse } from "@/lib/api/api";
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
    console.log(users)
    return users;
  } catch (error) {
    console.error("Failed to search for users:", error);
    return null;
  }
}