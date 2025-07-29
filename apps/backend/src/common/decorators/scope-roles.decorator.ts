import { SetMetadata } from '@nestjs/common';
import { ScopeRole } from '../types';

export const ScopeRoles = (...roles: ScopeRole[]) => SetMetadata('scope_roles', roles);