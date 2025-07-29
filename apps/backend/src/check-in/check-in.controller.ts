// src/check-in/check-in.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { CheckInDto } from './dto/check-in.dto';
import { WalkInCheckInDto } from './dto/walk-in-check-in.dto'; // Import new DTO
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Profile } from '@sportefy/db-types';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRole } from 'src/common/types';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { WalkInCheckOutDto } from './dto/walk-in-check-out.dto';

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
}
