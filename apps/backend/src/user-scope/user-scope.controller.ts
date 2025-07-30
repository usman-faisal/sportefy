import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  OmitType,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Scope, ScopeRole, UserRole } from 'src/common/types';
import { Profile } from '@sportefy/db-types';
import { UserScopeService } from './user-scope.service';
import {
  CreateUserScopeDto,
  CreateUserScopeDtoOmitGranted,
} from './dto/create-user-scope.dto';
import { FindVenuePipe } from 'src/venue/pipes/find-venue.pipe';
import { AddUserScopeVenueDto } from './dto/update-user-scope.dto';
import { UserScopeFacilityValidationPipe } from './pipes/user-scope-facility-validation.pipe';
import { NotSelfUserId } from 'src/common/decorators/not-self.decorator';
import { ApiScope } from 'src/common/decorators/scope.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';

@ApiTags('User Scope')
@Controller()
export class UserScopeController {
  constructor(private readonly userScopeService: UserScopeService) {}

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Post('facility/:facilityId/user-scope')
  @ApiOperation({ summary: 'Add a moderator to a facility' })
  @ApiParam({
    name: 'facilityId',
    type: String,
    description: 'The ID of the facility to add a moderator to',
  })
  @ApiResponse({ status: 200, description: 'Returns the updated facility.' })
  @ApiResponse({ status: 404, description: 'Facility not found.' })
  @ApiBody({
    type: OmitType(CreateUserScopeDto, [
      'grantedAt',
      'grantedBy',
      'scopeId',
      'scope',
    ]),
    required: true,
    description: 'Create user scope data',
  })
  @ApiScope([ScopeRole.OWNER], [Scope.FACILITY, 'facilityId'])
  async addFacilityModerator(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @CurrentUser() user: Profile,
    @Body(UserScopeFacilityValidationPipe)
    createUserScopeDto: CreateUserScopeDtoOmitGranted,
  ) {
    return this.userScopeService.addFacilityModerator(
      facilityId,
      user.id,
      createUserScopeDto,
    );
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Post('facility/:facilityId/venue/:venueId/user-scope')
  @ApiOperation({ summary: 'Add a moderator to a venue' })
  @ApiParam({
    name: 'facilityId',
    type: String,
    description: 'The ID of the facility to add a venue moderator to',
  })
  @ApiParam({
    name: 'venueId',
    type: String,
    description: 'The ID of the venue to add a moderator to',
  })
  @ApiResponse({ status: 200, description: 'Returns the updated facility.' })
  @ApiResponse({ status: 404, description: 'Facility or venue not found.' })
  @ApiBody({
    type: OmitType(CreateUserScopeDto, [
      'grantedAt',
      'grantedBy',
      'scopeId',
      'scope',
      'role',
    ]),
    required: true,
    description: 'Create user scope data',
  })
  @ApiScope(
    [ScopeRole.MODERATOR, ScopeRole.OWNER],
    [Scope.FACILITY, 'facilityId'],
  )
  async addVenueModerator(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @Param('venueId', ParseUUIDPipe) venueId: string,
    @CurrentUser() user: Profile,
    @Body() addUserScopeVenueDto: AddUserScopeVenueDto,
  ) {
    return this.userScopeService.addVenueModerator(
      venueId,
      user.id,
      addUserScopeVenueDto,
    );
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Delete('facility/:facilityId/user-scope/:userId')
  @ApiOperation({ summary: "Remove a user from a facility's user scope" })
  @ApiParam({
    name: 'facilityId',
    type: String,
    description: 'The ID of the scope',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: "The ID of the user to remove from the facility's user scope",
  })
  @ApiScope(
    [ScopeRole.MODERATOR, ScopeRole.OWNER],
    [Scope.FACILITY, 'facilityId'],
  )
  async removeFacilityModerator(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @NotSelfUserId('userId') userId: string,
  ) {
    return this.userScopeService.removeUserScope(
      userId,
      facilityId,
      Scope.FACILITY,
    );
  }

  @Delete('facility/:facilityId/venue/:venueId/user-scope/:userId')
  @Auth()
  @ApiOperation({ summary: "Remove a user from a venue's user scope" })
  @ApiParam({
    name: 'facilityId',
    type: String,
    description: 'The ID of the facility',
  })
  @ApiParam({
    name: 'venueId',
    type: String,
    description: 'The ID of the venue',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: "The ID of the user to remove from the venue's user scope",
  })
  @ApiScope(
    [ScopeRole.MODERATOR, ScopeRole.OWNER],
    [Scope.FACILITY, 'facilityId'],
  )
  async removeVenueModerator(
    @Param('venueId', ParseUUIDPipe) venueId: string,
    @NotSelfUserId('userId') userId: string,
  ) {
    return this.userScopeService.removeUserScope(userId, venueId, Scope.VENUE);
  }

  @Auth(UserRole.USER)
  @Get('user-scope/my-scopes')
  @ApiOperation({ summary: 'Get your user scopes' })
  @ApiResponse({ status: 200, description: 'Returns the updated facility.' })
  async getMyScopes(@CurrentUser() user: Profile) {
    return this.userScopeService.getMyUserScopes(user.id);
  }
}
