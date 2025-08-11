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
  ScanLine,
  MapPin,
  ChevronDown,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PermissionChecker } from "@/lib/utils/permissions";
import { Facility, Venue, UserScope } from "@sportefy/db-types";
import { ProfileWithScopes } from "@/lib/api/types";
import { signOut } from "@/lib/actions/auth-actions";

interface NavigationItem {
  href: string;
  icon: React.ElementType;
  label: string;
  permission?: (permissions: PermissionChecker) => boolean;
  children?: NavigationItem[];
}

const globalAdminLinks: NavigationItem[] = [
  { href: "/dashboard/admin", icon: Home, label: "Dashboard" },
  {
    href: "/dashboard/admin/payments/pending",
    icon: Shield,
    label: "Payment Verification",
  },
  { href: "/dashboard/admin/users", icon: Users, label: "User Management" },
  {
    href: "/dashboard/admin/user-scopes",
    icon: Users,
    label: "User Scopes",
  },
  {
    href: "/dashboard/admin/bookings",
    icon: ClipboardList,
    label: "All Bookings",
  },
  {
    href: "/dashboard/admin/facilities",
    icon: Building,
    label: "All Facilities",
  },
  {
    href: "/dashboard/admin/venues",
    icon: MapPin,
    label: "All Venues",
  },
  {
    href: "/dashboard/admin/reports",
    icon: BarChart2,
    label: "Global Reports",
  },
];

const staffLinks: NavigationItem[] = [
  { href: "/dashboard/staff", icon: Home, label: "Dashboard" },
  {
    href: "/dashboard/staff/bookings",
    icon: ClipboardList,
    label: "Bookings",
    permission: (p) => p.hasModeratorScope(),
  },
  {
    href: "/dashboard/staff/check-in",
    icon: ScanLine,
    label: "Check-In Scanner",
    permission: (p) => p.hasModeratorScope(),
  },
  {
    href: "/dashboard/staff/facilities",
    icon: Building,
    label: "My Facilities",
    permission: (p) => p.hasOwnerScope(),
  },
  {
    href: "/dashboard/staff/venues",
    icon: MapPin,
    label: "My Venues",
    permission: (p) => p.hasModeratorScope(),
  },
  {
    href: "/dashboard/staff/reports",
    icon: BarChart2,
    label: "Reports",
  },
];


const getNavigationLinks = (
  userRole: "admin" | "staff",
  permissions: PermissionChecker
): NavigationItem[] => {
  switch (userRole) {
    case "admin":
      return permissions.isGlobalAdmin() ? globalAdminLinks : staffLinks;
    case "staff":
      return staffLinks;
    default:
      return staffLinks;
  }
};

const getRoleDisplayName = (
  userRole: "admin" | "staff",
  permissions: PermissionChecker
): string => {
  if (permissions.isGlobalAdmin()) return "Global Admin";
  if (userRole === "admin" || userRole === "staff") return "Staff Panel";
  return "Dashboard";
};

interface UserScopeWithFacilityAndVenue extends UserScope {
  facility?: Facility;
  venue?: Venue;
}

interface ScopeGroup {
  type: "facility" | "venue";
  id: string;
  name: string;
  role: string;
  children?: ScopeGroup[];
}

const groupScopesByEntity = (
  scopes: UserScopeWithFacilityAndVenue[]
): ScopeGroup[] => {
  const facilityMap = new Map<string, ScopeGroup>();
  const venueMap = new Map<string, ScopeGroup>();

  scopes.forEach((scope) => {
    if (scope.facilityId && scope.facility) {
      if (!facilityMap.has(scope.facilityId)) {
        facilityMap.set(scope.facilityId, {
          type: "facility",
          id: scope.facilityId,
          name: scope.facility.name || "Unnamed Facility",
          role: scope.role,
          children: [],
        });
      }
    }

    if (scope.venueId && scope.venue) {
      const venueGroup: ScopeGroup = {
        type: "venue",
        id: scope.venueId,
        name: scope.venue.name || "Unnamed Venue",
        role: scope.role,
      };

      if (scope.venue.facilityId && facilityMap.has(scope.venue.facilityId)) {
        facilityMap.get(scope.venue.facilityId)!.children!.push(venueGroup);
      } else {
        venueMap.set(scope.venueId, venueGroup);
      }
    }
  });

  return [...facilityMap.values(), ...venueMap.values()];
};

interface AppSidebarProps {
  userRole: "admin" | "staff";
  userScopes?: UserScopeWithFacilityAndVenue[];
  user: ProfileWithScopes;
}

export function AppSidebar({
  userRole,
  userScopes = [],
  user,
}: AppSidebarProps) {
  const permissions = new PermissionChecker(user);
  const navigationLinks = getNavigationLinks(userRole, permissions);
  const roleDisplayName = getRoleDisplayName(userRole, permissions);
  const pathname = usePathname();
  const scopeGroups = groupScopesByEntity(userScopes);

  const handleSignOut = async () => {
    await signOut();
  };

  const renderNavigationItem = (item: NavigationItem) => {
    if (item.permission && !item.permission(permissions)) {
      return null;
    }

    return (
      <SidebarMenuItem key={item.label}>
        <SidebarMenuButton asChild isActive={pathname === item.href}>
          <Link href={item.href} className="flex items-center gap-3">
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderScopeGroup = (group: ScopeGroup) => {
    const hasChildren = group.children && group.children.length > 0;

    if (!hasChildren) {
      return (
        <SidebarMenuItem key={group.id}>
          <SidebarMenuButton asChild>
            <Link
              href={`/dashboard/staff/${group.type}s/${group.id}`}
              className="flex items-center gap-3"
            >
              {group.type === "facility" ? (
                <Building className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span>{group.name}</span>
              <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {group.role}
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <Collapsible key={group.id} defaultOpen>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="flex items-center gap-3">
              <Building className="h-4 w-4" />
              <span>{group.name}</span>
              <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {group.role}
              </span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {group.children?.map((child) => (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton asChild>
                    <Link
                      href={`/dashboard/staff/venues/${child.id}`}
                      className="flex items-center gap-3"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>{child.name}</span>
                      <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {child.role}
                      </span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
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
              {navigationLinks.map(renderNavigationItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Show scopes for staff users */}
        {(userRole === "staff" ||
          (userRole === "admin" && !permissions.isGlobalAdmin())) &&
          scopeGroups.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>My Access</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{scopeGroups.map(renderScopeGroup)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
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
