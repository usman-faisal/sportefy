import { Facility, Profile, UserScope, Venue } from "@sportefy/db-types";
import { ScopeRole, UserRole } from "../types";
import { ProfileWithScopes } from "../api/types";


export class PermissionChecker {
  constructor(private user: ProfileWithScopes) {}

  isGlobalAdmin(): boolean {
    return this.user.role === UserRole.ADMIN;
  }

  hasAdminScope(): boolean {
    return this.isGlobalAdmin() || false;
  }

  hasModeratorScope(): boolean {
    return (
      this.hasAdminScope() ||
      this.user.userScopes?.some((scope) => scope.role === ScopeRole.MODERATOR) ||
      false
    );
  }

  hasOwnerScope(): boolean {
    return (
      this.hasAdminScope() ||
      this.user.userScopes?.some((scope) => scope.role === ScopeRole.OWNER) ||
      false
    );
  }

  getManagedFacilities(): Facility[] {
    if (this.isGlobalAdmin()) return [];

    return (
      this.user.userScopes
        ?.filter(
          (scope) =>
            scope.facility &&
            (scope.role === ScopeRole.OWNER ||
              this.user.role === UserRole.ADMIN)
        )
        .map((scope) => scope.facility)
        .filter((facility): facility is Facility => facility !== undefined) ||
      []
    );
  }

  getModeratedVenues(): Venue[] {
    if (this.isGlobalAdmin()) return [];

    return (
      this.user.userScopes
        ?.filter(
          (scope) =>
            scope.venue &&
            (scope.role === ScopeRole.MODERATOR ||
              this.user.role === UserRole.ADMIN)
        )
        .map((scope) => scope.venue)
        .filter((venue): venue is Venue => venue !== undefined) || []
    );
  }

  canAccessAdminDashboard(): boolean {
    return this.hasAdminScope();
  }

  canAccessStaffDashboard(): boolean {
    return this.hasModeratorScope() || this.hasOwnerScope();
  }

  canManageFacility(facilityId: string): boolean {
    if (this.isGlobalAdmin()) return true;
    return (
      this.getManagedFacilities().find(
        (facility) => facility.id === facilityId
      ) !== undefined
    );
  }

  canModerateVenue(venueId: string): boolean {
    if (this.isGlobalAdmin()) return true;
    return (
      this.getModeratedVenues().find((venue) => venue.id === venueId) !==
      undefined
    );
  }
}
