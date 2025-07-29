import { UserScope, userScopes } from '@sportefy/db-types';
import { Scope } from '../types';
import { PgColumn } from 'drizzle-orm/pg-core';

export function getScopeId(scope: Scope): PgColumn {
  return scope === Scope.FACILITY ? userScopes.facilityId : userScopes.venueId;
}

export function getScopeField(scope: Scope): keyof UserScope {
  return scope === Scope.FACILITY ? 'facilityId' : 'venueId';
}
