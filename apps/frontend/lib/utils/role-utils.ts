import { EffectiveRole, ScopeRole, UserRole } from "@/lib/types";

export function getHighestScopeRole(scopes: any[]): ScopeRole | null {
  if (!scopes || scopes.length === 0) return null;

  const roleHierarchy = {
    [ScopeRole.OWNER]: 2,
    [ScopeRole.MODERATOR]: 1,
  };

  return scopes.reduce((highest: ScopeRole, scope: any) => {
    const current = scope.role as ScopeRole;
    return roleHierarchy[current] > roleHierarchy[highest] ? current : highest;
  }, ScopeRole.MODERATOR);
}

export function canAccessDashboard(effectiveRole: EffectiveRole): boolean {
  return effectiveRole !== UserRole.USER;
}

export function needsScopes(profileRole: UserRole): boolean {
  return profileRole === UserRole.USER;
}
