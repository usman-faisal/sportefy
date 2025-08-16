import { Controller, Post, Body, UseGuards, Req, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { CheckInDto } from './dto/check-in.dto';
import { WalkInCheckInDto } from './dto/walk-in-check-in.dto'; // Import new DTO
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { authSchema, Profile } from '@sportefy/db-types';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ScopeRole, UserRole } from 'src/common/types';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { WalkInCheckOutDto } from './dto/walk-in-check-out.dto';
import { ApiScope } from 'src/common/decorators/scope.decorator';
import { Scope } from 'src/common/types';

@Controller('check-in')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Auth(UserRole.USER)
  @Post('booking')
  checkInByQr(@CurrentUser() user: Profile, @Body() checkInDto: CheckInDto) {
    return this.checkInService.checkIn(user, checkInDto);
  }

  @ApiOperation({ summary: 'Walk-in check-in' })
  @ApiBody({ type: WalkInCheckInDto })
  @Auth(UserRole.USER)
  @Post('walk-in')
  walkInCheckIn(
    @CurrentUser() user: Profile,
    @Body() walkInCheckInDto: WalkInCheckInDto,
  ) {
    return this.checkInService.walkInCheckIn(user, walkInCheckInDto);
  }

  @Auth(UserRole.USER)
  @Post('walk-in/checkout')
  walkInCheckOut(
    @CurrentUser() user: Profile,
    @Body() walkInCheckOutDto: WalkInCheckOutDto,
  ) {
    return this.checkInService.walkInCheckOut(user, walkInCheckOutDto);
  }

  @Auth(UserRole.USER)
  @Get()
  @ApiOperation({ summary: 'Get user check-ins' })
  getUserCheckIns(@CurrentUser() user: Profile) {
    return this.checkInService.getUserCheckIns(user.id);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @ApiScope([ScopeRole.MODERATOR, ScopeRole.OWNER], [Scope.VENUE, 'venueId'])
  @Get('venues/:venueId/count')
  @ApiOperation({ summary: 'Get current check-in count for a venue' })
  @ApiParam({ name: 'venueId', type: String, description: 'The ID of the venue' })
  getVenueCheckInCount(@Param('venueId', ParseUUIDPipe) venueId: string) {
    return this.checkInService.getVenueCheckInCount(venueId);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @ApiScope([ScopeRole.MODERATOR, ScopeRole.OWNER], [Scope.VENUE, 'venueId'])
  @Get('venues/:venueId')
  @ApiOperation({ summary: 'Get all check-ins for a venue' })
  @ApiParam({ name: 'venueId', type: String, description: 'The ID of the venue' })
  getVenueCheckIns(@Param('venueId', ParseUUIDPipe) venueId: string) {
    return this.checkInService.getVenueCheckIns(venueId);
  }
}
