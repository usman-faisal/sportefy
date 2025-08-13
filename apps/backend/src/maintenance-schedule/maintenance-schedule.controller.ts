import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Scope, ScopeRole, UserRole } from 'src/common/types';
import { CreateMaintenanceScheduleDto } from './dto/create-maintenance-schedule.dto';
import { UpdateMaintenanceScheduleDto } from './dto/update-maintenance-schedule.dto';
import { MaintenanceScheduleService } from './maintenance-schedule.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Profile } from '@sportefy/db-types';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiScope } from 'src/common/decorators/scope.decorator';

@ApiTags('Maintenance Schedule')
@Controller('venues/:venueId/maintenance-schedules')
@ApiParam({ name: 'venueId', type: String, description: 'ID of the venue' })
export class MaintenanceScheduleController {
  constructor(
    private readonly maintenanceScheduleService: MaintenanceScheduleService,
  ) {}

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Get()
  @ApiOperation({ summary: 'Get maintenance schedules for a venue' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of maintenance schedules.',
  })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR], [Scope.VENUE, 'venueId'])
  getMaintenanceSchedules(@Param('venueId') venueId: string) {
    return this.maintenanceScheduleService.getMaintenanceSchedules(venueId);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Post()
  @ApiOperation({ summary: 'Create a new maintenance schedule' })
  @ApiBody({ type: CreateMaintenanceScheduleDto, required: true })
  @ApiResponse({
    status: 201,
    description: 'Maintenance schedule created successfully.',
  })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR], [Scope.VENUE, 'venueId'])
  async createMaintenanceSchedule(
    @CurrentUser() user: Profile,
    @Param('venueId') venueId: string,
    @Body() createMaintenanceScheduleDto: CreateMaintenanceScheduleDto,
  ) {
    return this.maintenanceScheduleService.createMaintenanceSchedule(

      venueId,
      user.id,
      createMaintenanceScheduleDto,

    );
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a maintenance schedule' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the maintenance schedule',
  })
  @ApiBody({ type: UpdateMaintenanceScheduleDto, required: true })
  @ApiResponse({
    status: 200,
    description: 'Maintenance schedule updated successfully.',
  })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR], [Scope.VENUE, 'venueId'])
  async updateMaintenanceSchedule(
    @CurrentUser() user: Profile,
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @Body() updateMaintenanceScheduleDto: UpdateMaintenanceScheduleDto,
  ) {
    return this.maintenanceScheduleService.updateMaintenanceSchedule(
      id,
      updateMaintenanceScheduleDto,
    );
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a maintenance schedule' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the maintenance schedule',
  })
  @ApiResponse({
    status: 200,
    description: 'Maintenance schedule deleted successfully.',
  })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR], [Scope.VENUE, 'venueId'])
  async deleteMaintenanceSchedule(
    @CurrentUser() user: Profile,
    @Param('venueId') venueId: string,
    @Param('id') id: string,
  ) {
    return this.maintenanceScheduleService.deleteMaintenanceSchedule(id);
  }
}
