// src/common/guards/scope.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Profile, userScopes, venues } from '@sportefy/db-types';
import { Scope, ScopeRole, UserRole } from '../types';
import { UserScopeRepository } from 'src/user-scope/user-scope.repository';
import { VenueRepository } from 'src/venue/venue.repository';
import { and, eq } from 'drizzle-orm';
import { SCOPE_CONTEXT } from '../decorators/scope-context.decorator';
import { getScopeId } from '../utils/user-scope';

@Injectable()
export class ScopeGuard implements CanActivate {
  private readonly logger = new Logger(ScopeGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly userScopeRepository: UserScopeRepository,
    private readonly venueRepository: VenueRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ScopeRole[]>(
      'scope_roles',
      [context.getHandler(), context.getClass()],
    );
    this.logger.log(context);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: Profile = request.user;

    if (!user) {
      throw new InternalServerErrorException(
        'User object not found on request.',
      );
    }
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    let scope: Scope;
    let scopeId: string;
    let parentId: string | null = null;

    const scopeContext = this.reflector.get<{
      scope: Scope;
      paramName: string;
    }>(SCOPE_CONTEXT, context.getHandler());

    if (scopeContext) {
      scope = scopeContext.scope;
      scopeId = request.params[scopeContext.paramName];
      if (request.params.facilityId) {
        parentId = request.params.facilityId;
      }
    } else {
      scope = this.getScopeEnum(request.params.scope);
      scopeId = request.params.scopeId;
    }

    if (!scope || !scopeId) {
      throw new InternalServerErrorException(
        'ScopeGuard could not determine scope and scopeId from route.',
      );
    }
    const hasDirectPermission = await this.checkUserPermission(
      user.id,
      scopeId,
      scope,
      requiredRoles,
    );
    if (hasDirectPermission) return true;

    if (scope === Scope.VENUE) {
      const facilityIdToCheck =
        parentId ??
        (await this.venueRepository.getVenueById(scopeId))?.facilityId;

      if (facilityIdToCheck) {
        const hasParentPermission = await this.checkUserPermission(
          user.id,
          facilityIdToCheck,
          Scope.FACILITY,
          requiredRoles,
        );
        if (hasParentPermission) return true;
      }
    }

    throw new ForbiddenException(
      `User does not have the required permissions for scope "${scope}" with ID "${scopeId}".`,
    );
  }
  private getScopeEnum(scope: string): Scope {
    const upperScope = scope.toLowerCase();
    if (!Object.values(Scope).includes(upperScope as Scope)) {
      throw new BadRequestException(`Invalid scope: "${scope}"`);
    }
    return upperScope as Scope;
  }

  private async checkUserPermission(
    userId: string,
    scopeId: string,
    scope: Scope,
    requiredRoles: ScopeRole[],
  ): Promise<boolean> {
    const permission = await this.userScopeRepository.getUserScope(
      and(eq(userScopes.userId, userId), eq(getScopeId(scope), scopeId)),
    );

    if (!permission) {
      return false;
    }

    return requiredRoles.includes(permission.role as ScopeRole);
  }
}
