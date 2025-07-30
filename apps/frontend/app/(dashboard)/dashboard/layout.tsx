import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { profileService, userScopeService } from "@/lib/api/services";
import UserProvider from "@/lib/context/user-provider";
import { UserRole } from "@/lib/types";
import { redirect } from "next/navigation";

async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await profileService.getProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  let sidebarComponent = null;

  if (profile.role === UserRole.ADMIN) {
    sidebarComponent = <AppSidebar userRole={UserRole.ADMIN} />;
  } else if (profile.role === UserRole.USER) {
    const userScopes = await userScopeService.getMyUserScopes();
    if (!userScopes || userScopes.length === 0) {
      redirect("/auth/login?error=no_scope_access");
    }
    sidebarComponent = <AppSidebar userRole={UserRole.USER} />;
  }

  return (
    <SidebarProvider>
      <UserProvider user={profile}>
        <div className="flex min-h-screen">
          {sidebarComponent}
          <main className="flex-1 bg-gray-50">{children}</main>
        </div>
      </UserProvider>
    </SidebarProvider>
  );
}

export default DashboardLayout;
