import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRole } from 'src/common/types';
import { BookingOverviewService } from './booking-overview.service';
import { GetBookingOverviewDto } from './dto/get-booking-overview.dto';

@ApiTags('Admin: Booking Overview')
@Auth(UserRole.ADMIN)
@Controller('admin/booking-overview')
export class BookingOverviewController {
  constructor(
    private readonly bookingOverviewService: BookingOverviewService,
  ) {}

  @Auth(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get a daily overview of bookings and revenue' })
  getDailyOverview(@Query() query: GetBookingOverviewDto) {
    return this.bookingOverviewService.getDailyOverview(query);
  }
}
