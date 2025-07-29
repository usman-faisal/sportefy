import { Injectable } from '@nestjs/common';
import { ProfileRepository } from 'src/profile/profile.repository';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { ReportRepository } from './report.repository';
import { format } from 'date-fns';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async getDashboardReports() {
    const [dailyRevenue, bookingTrends, popularTimeSlots] = await Promise.all([
      this.reportRepository.getDailyRevenue(new Date()),
      this.reportRepository.getBookingTrends(),
      this.reportRepository.getPopularTimeSlots(),
    ]);

    // Format the results for a clean API response
    const formattedTrends = bookingTrends.map((trend) => ({
      date: format(new Date(trend.date), 'yyyy-MM-dd'),
      count: trend.count,
    }));

    const formattedPopularSlots = popularTimeSlots.map((slot) => ({
      time: format(new Date(slot.startTime), 'HH:mm'), // Format to show only the time
      bookings: slot.bookingCount,
    }));

    const report = {
      summary: {
        dailyRevenue,
      },
      bookingTrends: formattedTrends,
      popularTimeSlots: formattedPopularSlots,
    };

    return ResponseBuilder.success(report, 'Reports generated successfully.');
  }
}
