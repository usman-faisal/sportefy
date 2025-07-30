import { applyDecorators, UseGuards } from '@nestjs/common';
import { Scope, ScopeRole } from '../types';
import { ScopeGuard } from '../guards/scope.guard';
import { ScopeRoles } from './scope-roles.decorator';
import { ScopeContext } from './scope-context.decorator';

export function ApiScope(roles: ScopeRole[], scopeContext?: [Scope, string]) {
  const decorators = [UseGuards(ScopeGuard), ScopeRoles(...roles)];
  if (scopeContext) {
    decorators.push(ScopeContext(...scopeContext));
  }
  return applyDecorators(...decorators);
}
