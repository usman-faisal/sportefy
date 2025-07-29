import { Module } from '@nestjs/common';
import { BookingOverviewModule } from './booking-overview/booking-overview.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [BookingOverviewModule, ReportModule],
  providers: [],
})
export class AdminModule {}
