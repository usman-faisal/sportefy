import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Scope, ScopeRole, UserRole } from 'src/common/types';
import { SearchVenuesQuery } from './dto/search-venues.query';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Venue, Profile, Facility } from '@sportefy/db-types';
import { FindVenuePipe } from './pipes/find-venue.pipe';
import { VenueService } from './venue.service';
import { FindFacilityPipe } from 'src/facility/pipes/find-facility.pipe';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiScope } from 'src/common/decorators/scope.decorator';

@ApiTags('Venue')
@Controller()
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Public()
  @Get('venues')
  @ApiOperation({ summary: 'Get a list of venues' })
  @ApiResponse({
    status: 200,
    description:
      'Returns a paginated list of venues matching the search criteria.',
  })
  async getVenues(@Query() searchVenuesQuery: SearchVenuesQuery) {
    return this.venueService.getVenues(searchVenuesQuery);
  }

  @Public()
  @Get('venues/:venueId')
  @ApiOperation({ summary: 'Get a venue by venue Id' })
  @ApiParam({
    name: 'venue Id',
    type: String,
    description: 'The venue Id of the venue to retrieve',
  })
  @ApiResponse({ status: 200, description: 'Returns a venue.' })
  @ApiResponse({ status: 404, description: 'Venue not found.' })
  async getVenue(@Param('venueId') venueId: string) {
    return this.venueService.getVenue(venueId);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @ApiScope(
    [ScopeRole.OWNER, ScopeRole.MODERATOR],
    [Scope.FACILITY, 'facilityId'],
  )
  @Post('facility/:facilityId/venues')
  @ApiOperation({ summary: 'Create a new venue' })
  @ApiBody({
    type: CreateVenueDto,
    required: true,
    description: 'Data for creating a new venue',
  })
  @ApiParam({
    name: 'facilityId',
    type: String,
    description: 'The ID of the facility to create the venue for',
  })
  async createVenue(
    @CurrentUser() user: Profile,
    @Body() body: CreateVenueDto,
    @Param('facilityId', FindFacilityPipe) facilityId: Facility,
  ) {
    return this.venueService.createVenue(facilityId.id, body);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Patch('facility/:facilityId/venues/:venueId')
  @ApiOperation({ summary: 'Update an existing venue' })
  @ApiParam({
    name: 'facilityId',
    type: String,
    description: 'The ID of the facility that contains the venue',
  })
  @ApiParam({
    name: 'venueId',
    type: String,
    description: 'The ID of the venue to update',
  })
  @ApiBody({ type: UpdateVenueDto, description: 'Data for updating the venue' })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR], [Scope.VENUE, 'venueId'])
  async updateVenue(
    @Param('facilityId', ParseUUIDPipe) facility: string,
    @Param('venueId', FindVenuePipe) venue: Venue,
    @Body() body: UpdateVenueDto,
  ) {
    return this.venueService.updateVenue(venue.id, body);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Delete('facility/:facilityId/venues/:venueId')
  @ApiOperation({ summary: 'Delete an existing venue' })
  @ApiParam({
    name: 'venueId',
    type: String,
    description: 'The ID of the venue to delete',
  })
  @ApiScope(
    [ScopeRole.OWNER, ScopeRole.MODERATOR],
    [Scope.FACILITY, 'facilityId'],
  )
  async deleteVenue(
    @Param('venueId', ParseUUIDPipe, FindVenuePipe) venue: Venue,
  ) {
    return this.venueService.deleteVenue(venue.id);
  }
}
