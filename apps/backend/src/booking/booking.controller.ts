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
  ApiTags,
} from '@nestjs/swagger';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CheckInService } from 'src/check-in/check-in.service';
import { GetBookingsDto } from './dto/get-bookings.dto';

@ApiTags('Bookings') // Groups endpoints in Swagger UI
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

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
    @Body() createBookingDto: CreateBookingDto, // DTO now contains venueId
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
