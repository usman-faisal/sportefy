
import { profileService } from "@/lib/api/services";
import { PermissionChecker } from "@/lib/utils/permissions";
import { redirect } from "next/navigation";

interface DashboardLayoutProps {
  admin: React.ReactNode;
  staff: React.ReactNode;
}

export default async function DashboardLayout({
  admin,
  staff,
}: DashboardLayoutProps) {
  const profile = await profileService.getProfileWithScopes();

  if (!profile) {
    redirect("/auth/login");
  }

  const permissions = new PermissionChecker(profile);
  
  if (permissions.canAccessAdminDashboard()) {
    return admin;
  }

  if (permissions.canAccessStaffDashboard()) {
    return staff;
  }
}
