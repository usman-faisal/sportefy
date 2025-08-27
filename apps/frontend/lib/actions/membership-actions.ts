"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api/api";
import { Membership } from "@sportefy/db-types";

export async function createMembership(payload: Partial<Membership>) {
  const res = await api<Membership>("/admin/memberships", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  revalidatePath("/dashboard/admin/memberships");
  return res;
}

export async function updateMembership(id: string, payload: Partial<Membership>) {
  const res = await api<Membership>(`/admin/memberships/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  revalidatePath("/dashboard/admin/memberships");
  return res;
}

export async function deleteMembership(id: string) {
  const res = await api<Membership>(`/admin/memberships/${id}`, {
    method: "DELETE",
  });
  revalidatePath("/dashboard/admin/memberships");
  return res;
}


