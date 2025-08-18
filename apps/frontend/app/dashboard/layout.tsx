export const dynamic = "force-dynamic";

import { profileService } from "@/lib/api/services";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar";
import UserProvider from "@/lib/context/user-provider";
import { PermissionChecker } from "@/lib/utils/permissions";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await profileService.getProfileWithScopes();
  
  if (!profile) {
    redirect("/unauthorized");
  }

  const permissions = new PermissionChecker(profile);
  
  let userRole: "admin" | "staff" = "staff";
  if (permissions.isGlobalAdmin()) {
    userRole = "admin";
  } else if (permissions.canAccessStaffDashboard()) {
    userRole = "staff";
  } else {
    redirect("/unauthorized");
  }

  return (
    <SidebarProvider>
    <UserProvider user={profile}>
      <div className="flex h-screen bg-background w-full">
        <AppSidebar
          userRole={userRole}
          userScopes={profile.userScopes || []}
          user={profile}
        />
        <main className="flex-1 p-4 w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </UserProvider>
    </SidebarProvider>
  );
}
