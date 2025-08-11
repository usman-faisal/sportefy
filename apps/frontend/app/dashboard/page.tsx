export const dynamic = "force-dynamic";

import { profileService } from "@/lib/api/services";
import { PermissionChecker } from "@/lib/utils/permissions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const profile = await profileService.getProfileWithScopes();
  
  if (!profile) {
    redirect("/auth/login");
  }

  const permissions = new PermissionChecker(profile);
  
  if (permissions.canAccessAdminDashboard()) {
    redirect("/dashboard/admin");
  }
  
  if (permissions.canAccessStaffDashboard()) {
    redirect("/dashboard/staff");
  }
  
  redirect("/unauthorized");
}   