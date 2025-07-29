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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { FacilityService } from './facility.service';
import { Scope, ScopeRole, UserRole } from 'src/common/types';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Facility, Profile } from '@sportefy/db-types';
import { FindFacilityPipe } from './pipes/find-facility.pipe';
import { SearchFacilitiesQuery } from './dto/search-facilities.query';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiScope } from 'src/common/decorators/scope.decorator';
import { FacilityCreationPipe } from './pipes/facility-creation.pipe';

@ApiTags('Facility')
@Controller('facilities')
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get a list of facilities' })
  @ApiResponse({
    status: 200,
    description:
      'Returns a paginated list of facilities matching the search criteria.',
  })
  async getFacilities(@Query() searchFacilitiesQuery: SearchFacilitiesQuery) {
    return this.facilityService.getFacilities(searchFacilitiesQuery);
  }

  @Public()
  @Get(':facilityId')
  @ApiOperation({ summary: 'Get a facility' })
  @ApiResponse({ status: 200, description: 'Returns a facility.' })
  async getFacility(@Param('facilityId', ParseUUIDPipe) facilityId: string) {
    return this.facilityService.getFacility(facilityId);
  }

  @Auth(UserRole.ADMIN)
  @Post()
  @ApiBody({
    type: CreateFacilityDto,
    required: true,
    description: 'Data for creating a new facility',
  })
  async createFacility(
    @CurrentUser() user: Profile,
    @Body(FacilityCreationPipe) body: CreateFacilityDto,
  ) {
    return this.facilityService.createFacility(user.id, body);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Patch(':facilityId')
  @ApiOperation({ summary: 'Update an existing facility' })
  @ApiParam({
    name: 'facilityId',
    type: String,
    description: 'The ID of the facility to update',
  })
  @ApiBody({
    type: PartialType(
      OmitType(CreateFacilityDto, ['operatingHours', 'ownerId', 'media']),
    ),
    description: 'Data for updating the facility',
  })
  @ApiScope(
    [ScopeRole.OWNER, ScopeRole.MODERATOR],
    [Scope.FACILITY, 'facilityId'],
  )
  async updateFacility(
    @CurrentUser() user: Profile,
    @Param('facilityId', FindFacilityPipe) facility: Facility, // <-- Use the Pipe here
    @Body() body: UpdateFacilityDto,
  ) {
    return this.facilityService.updateFacility(user, facility, body);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Delete(':facilityId')
  @ApiOperation({ summary: 'delete an existing facility' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the facility to update',
  })
  @ApiScope(
    [ScopeRole.OWNER, ScopeRole.MODERATOR],
    [Scope.FACILITY, 'facilityId'],
  )
  async deleteFacility(
    @CurrentUser() user: Profile,
    @Param('facilityId', FindFacilityPipe) facility: Facility,
  ) {
    return this.facilityService.deleteFacility(user, facility);
  }
}
