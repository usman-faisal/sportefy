import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserScopeDtoOmitGranted } from './dto/create-user-scope.dto';
import { Scope, ScopeRole } from 'src/common/types';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { UserScopeRepository } from './user-scope.repository';
import { and, eq } from 'drizzle-orm';
import { userScopes } from '@sportefy/db-types';
import { FacilityRepository } from 'src/facility/facility.repository';
import { AddUserScopeVenueDto } from './dto/update-user-scope.dto';
import { getScopeId } from 'src/common/utils/user-scope';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';

@Injectable()
export class UserScopeService {
  constructor(
    private readonly userScopeRepository: UserScopeRepository,
    private readonly facilityRepository: FacilityRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async addFacilityModerator(
    facilityId: string,
    userId: string,
    createUserScopeDto: CreateUserScopeDtoOmitGranted,
  ) {
    const existingScope = await this.userScopeRepository.getUserScope(
      and(
        eq(userScopes.facilityId, facilityId),
        eq(userScopes.userId, createUserScopeDto.userId),
      ),
    );

    if (existingScope) {
      throw new BadRequestException(
        'User already has a moderator role for this facility',
      );
    }
    const newUserScope = await this.userScopeRepository.createUserScope({
      ...createUserScopeDto,
      facilityId: facilityId,
      grantedBy: userId,
      grantedAt: new Date(),
    });

    if (createUserScopeDto.role === ScopeRole.OWNER) {
      await this.facilityRepository.updateFacilityById(facilityId, {
        ownerId: createUserScopeDto.userId,
      });
    }

    return ResponseBuilder.created(
      newUserScope,
      'Facility moderator added successfully',
    );
  }

  async addVenueModerator(
    venueId: string,
    userId: string,
    addUserScopeVenueDto: AddUserScopeVenueDto,
  ) {
    const existingScope = await this.userScopeRepository.getUserScope(
      and(eq(userScopes.userId, userId), eq(userScopes.venueId, venueId)),
    );
    if (existingScope) {
      throw new InternalServerErrorException(
        'User already has a moderator role for this venue',
      );
    }
    const newUserScope = await this.userScopeRepository.createUserScope({
      ...addUserScopeVenueDto,
      role: ScopeRole.MODERATOR,
      userId: userId,
      venueId: venueId,
      grantedBy: userId,
      grantedAt: new Date(),
    });

    return ResponseBuilder.created(
      newUserScope,
      'Venue moderator added successfully',
    );
  }

  async removeUserScope(userId: string, scopeId: string, scope: Scope) {
    this.unitOfWork.do(async (tx) => {
      const [deletedScope] = await this.userScopeRepository.deleteUserScope(
        and(eq(userScopes.userId, userId), eq(getScopeId(scope), scopeId)),
        tx,
      );
      if (deletedScope.facilityId && deletedScope.role === ScopeRole.OWNER) {
        await this.facilityRepository.updateFacilityById(
          deletedScope.facilityId,
          {
            ownerId: undefined,
          },
        );
      }
    });
    return ResponseBuilder.deleted('User scope removed successfully');
  }

  async getMyUserScopes(userId: string) {
    const scopes = await this.userScopeRepository.getManyUserScopes(
      eq(userScopes.userId, userId),
      { facility: true, venue: true },
    );

    return ResponseBuilder.success(scopes, 'fetched scopes successfully');
  }
}
