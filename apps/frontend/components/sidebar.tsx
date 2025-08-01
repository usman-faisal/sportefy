"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Shield,
  Building,
  Users,
  BarChart2,
  Settings,
  LogOut,
  ClipboardList,
  Bell,
  ScanLine,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserRole } from "@/lib/types";
import { signOut } from "@/app/actions/auth-actions";

interface NavigationItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

const adminLinks: NavigationItem[] = [
  { href: "/dashboard/admin", icon: Home, label: "Dashboard" },
  {
    href: "/dashboard/admin/payments",
    icon: Shield,
    label: "Payment Verification",
  },
  { href: "/dashboard/admin/users", icon: Users, label: "User Management" },
  {
    href: "/dashboard/admin/bookings",
    icon: ClipboardList,
    label: "Booking Overview",
  },
  {
    href: "/dashboard/admin/facilities",
    icon: Building,
    label: "All Facilities",
  },
  { href: "/dashboard/admin/reports", icon: BarChart2, label: "Reports" },
];

const moderatorLinks: NavigationItem[] = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/bookings", icon: ClipboardList, label: "My Bookings" },
  { href: "/dashboard/check-in", icon: ScanLine, label: "Check-In Scanner" },
  { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
];
const getNavigationLinks = (userRole: UserRole): NavigationItem[] => {
  switch (userRole) {
    case "admin":
      return adminLinks;
    case "user":
      return moderatorLinks;
    default:
      return moderatorLinks;
  }
};

const getRoleDisplayName = (userRole: UserRole): string => {
  switch (userRole) {
    case "admin":
      return "Admin Panel";
    default:
      return "Dashboard";
  }
};

interface AppSidebarProps {
  userRole: UserRole;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const navigationLinks = getNavigationLinks(userRole);
  const roleDisplayName = getRoleDisplayName(userRole);
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">S</span>
          </div>
          <span className="text-lg font-bold">Sportefy</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{roleDisplayName}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationLinks.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="flex items-center gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
