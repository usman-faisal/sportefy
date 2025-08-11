import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Profile } from '@sportefy/db-types';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRole } from 'src/common/types';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { GetBookingsDto } from './dto/get-bookings.dto';
import { SearchBookingsQuery } from './dto/search-bookings.query';
import { BookingStatsResponseDto } from './dto/booking-stats-response.dto';
import { UserScopeService } from 'src/user-scope/user-scope.service';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly userScopeService: UserScopeService,
  ) {}

  @Auth(UserRole.USER)
  @Get()
  @ApiOperation({ summary: 'Get all bookings for the current user' })
  @ApiQuery({ type: GetBookingsDto })
  async getUserBookings(
    @CurrentUser() user: Profile,
    @Query() getBookingsDto: GetBookingsDto,
  ) {
    return this.bookingService.getUserBookings(user, getBookingsDto);
  }

  @Auth(UserRole.ADMIN)
  @Get('all')
  @ApiOperation({ summary: 'Get all bookings with search and filter options' })
  @ApiQuery({ type: SearchBookingsQuery })
  async getAllBookings(@Query() searchBookingsQuery: SearchBookingsQuery) {
    return this.bookingService.getAllBookings(searchBookingsQuery);
  }

  @Auth(UserRole.ADMIN)
  @Get('stats')
  @ApiOperation({
    summary: 'Get booking statistics including revenue and counts',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns booking statistics',
    type: BookingStatsResponseDto,
  })
  async getBookingStats() {
    return this.bookingService.getBookingStats();
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Get('staff')
  @ApiOperation({ summary: 'Get all bookings for staff based on their scope' })
  @ApiQuery({ type: SearchBookingsQuery })
  async getStaffBookings(@Query() searchBookingsQuery: SearchBookingsQuery, @CurrentUser() user: Profile) {
    // Get user scopes from the user scope service
    const userScopesResponse = await this.userScopeService.getMyUserScopes(user.id);
    const userScopes = userScopesResponse.data || [];
    return this.bookingService.getStaffBookings(searchBookingsQuery, userScopes);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Get('staff/stats')
  @ApiOperation({ summary: 'Get booking statistics for staff based on their scope' })
  async getStaffBookingStats(@CurrentUser() user: Profile) {
    const userScopesResponse = await this.userScopeService.getMyUserScopes(user.id);
    const userScopes = userScopesResponse.data || [];
    return this.bookingService.getStaffBookingStats(userScopes);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Get(':id')
  @ApiOperation({ summary: 'Get a single booking by its ID' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the booking' })
  async getBooking(
    @CurrentUser() user: Profile,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingService.getBooking(user, id);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiBody({ type: CreateBookingDto })
  async createBooking(
    @CurrentUser() user: Profile,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingService.createBooking(user, createBookingDto);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking (e.g., to cancel it)' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the booking to update',
  })
  @ApiBody({ type: UpdateBookingDto })
  async updateBooking(
    @CurrentUser() user: Profile,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingService.updateBooking(user, id, updateBookingDto);
  }
}
