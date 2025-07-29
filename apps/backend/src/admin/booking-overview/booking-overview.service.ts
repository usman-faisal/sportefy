import { Injectable } from '@nestjs/common';
import { GetBookingOverviewDto } from './dto/get-booking-overview.dto';
import { BookingRepository } from 'src/booking/booking.repository';
import { VenueRepository } from 'src/venue/venue.repository';
import { ResponseBuilder } from 'src/common/utils/response-builder';

@Injectable()
export class BookingOverviewService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly venueRepository: VenueRepository,
  ) {}

  async getDailyOverview(query: GetBookingOverviewDto) {
    const { date } = query;
    const targetDate = date || new Date();

    const venues = await this.venueRepository.getManyVenues(undefined);
    if (!venues || venues.length === 0) {
      return ResponseBuilder.success(
        { courts: [], summary: this.getEmptySummary() },
        'No venue data available.',
      );
    }

    const TOTAL_POSSIBLE_SLOTS_PER_COURT = 14;

    const bookings =
      await this.bookingRepository.findBookingsByDate(targetDate);

    let totalRevenue = 0;
    let totalBookedSlots = 0;
    let totalNoShows = 0;

    const courtData = venues.map((venue) => {
      const courtBookings = bookings.filter(
        (b) => b.booking.venueId === venue.id && b.slot,
      );
      const bookedSlots = courtBookings.length;
      const courtRevenue = courtBookings.reduce(
        (sum, b) => sum + b.booking.totalCredits,
        0,
      );
      const noShows = courtBookings.filter(
        (b) => b.booking.status === 'completed',
      ).length;

      totalRevenue += courtRevenue;
      totalBookedSlots += bookedSlots;
      totalNoShows += noShows;

      return {
        courtId: venue.id,
        courtName: venue.name || `Court ${venue.id.slice(0, 4)}`,
        bookedSlots,
        availableSlots: TOTAL_POSSIBLE_SLOTS_PER_COURT - bookedSlots,
        occupancyRate: (bookedSlots / TOTAL_POSSIBLE_SLOTS_PER_COURT) * 100,
        revenue: courtRevenue,
        noShows,
      };
    });

    const totalPossibleSlots = venues.length * TOTAL_POSSIBLE_SLOTS_PER_COURT;
    const overallOccupancy =
      totalPossibleSlots > 0
        ? (totalBookedSlots / totalPossibleSlots) * 100
        : 0;

    const summary = {
      date: targetDate.toISOString().split('T')[0],
      totalRevenue,
      totalBookings: totalBookedSlots,
      totalNoShows,
      overallOccupancyRate: overallOccupancy,
    };

    return ResponseBuilder.success({
      summary,
      courts: courtData,
    });
  }

  private getEmptySummary() {
    return {
      date: new Date().toISOString().split('T')[0],
      totalRevenue: 0,
      totalBookings: 0,
      totalNoShows: 0,
      overallOccupancyRate: 0,
    };
  }
}
