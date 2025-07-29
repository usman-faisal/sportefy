import { Module } from '@nestjs/common';
import { BookingOverviewService } from './booking-overview.service';
import { BookingOverviewController } from './booking-overview.controller';
import { BookingModule } from 'src/booking/booking.module';
import { VenueModule } from 'src/venue/venue.module';

@Module({
  imports: [BookingModule, VenueModule],
  controllers: [BookingOverviewController],
  providers: [BookingOverviewService],
})
export class BookingOverviewModule {}
