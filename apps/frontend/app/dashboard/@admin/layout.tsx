export const dynamic = "force-dynamic";

import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { profileService } from "@/lib/api/services";
import UserProvider from "@/lib/context/user-provider";
import { PermissionChecker } from "@/lib/utils/permissions";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await profileService.getProfileWithScopes();
  if (!profile) {
    redirect("/auth/login");
  }
  
  return (
    <SidebarProvider>
      <UserProvider user={profile}>
        <div className="flex w-full h-screen">
          <AppSidebar
            userRole="admin"
            userScopes={profile.userScopes || []}
            user={profile}
          />
          <main className="flex-1 p-4 w-full overflow-y-auto">{children}</main>
        </div>
      </UserProvider>
    </SidebarProvider>
  );
}
