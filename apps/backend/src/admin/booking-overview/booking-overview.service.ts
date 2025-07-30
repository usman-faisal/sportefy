import { Injectable } from '@nestjs/common';
import { GetBookingOverviewDto } from './dto/get-booking-overview.dto';
import { BookingRepository } from 'src/booking/booking.repository';
import { VenueRepository } from 'src/venue/venue.repository';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { PaginatedResult } from 'src/common/types';

@Injectable()
export class BookingOverviewService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly venueRepository: VenueRepository,
  ) {}

  async getDailyOverview(query: GetBookingOverviewDto) {
    const { date, limit, offset, page } = query;
    const targetDate = date || new Date();

    const totalVenues = await this.venueRepository.count(undefined);

    if (totalVenues === 0) {
      const emptyResponse = {
        summary: this.getEmptySummary(),
        courts: {
          data: [],
          pagination: {
            page: page || 1,
            limit: limit || 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
      return ResponseBuilder.success(emptyResponse, 'No venue data available.');
    }

    const allBookings =
      await this.bookingRepository.findBookingsByDate(targetDate);

    const TOTAL_POSSIBLE_SLOTS_PER_COURT = 14;
    const totalPossibleSlots = totalVenues * TOTAL_POSSIBLE_SLOTS_PER_COURT;

    let totalRevenue = 0;
    let totalBookedSlots = 0;
    let totalNoShows = 0;

    allBookings.forEach((booking) => {
      if (booking.slot) {
        totalBookedSlots++;
        totalRevenue += booking.booking.totalCredits;
        if (booking.booking.status === 'completed') {
          totalNoShows++;
        }
      }
    });

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

    const venues = await this.venueRepository.getManyVenues(
      undefined,
      undefined,
      limit,
      offset,
    );

    const courtData = venues.map((venue) => {
      const courtBookings = allBookings.filter(
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

    const paginationLimit = limit || 10;
    const paginationPage = page || 1;
    const totalPages = Math.ceil(totalVenues / paginationLimit);
    const hasNext = paginationPage < totalPages;
    const hasPrev = paginationPage > 1;

    return ResponseBuilder.paginated(courtData, {
      page: paginationPage,
      limit: paginationLimit,
      total: totalVenues,
      totalPages,
      hasNext,
      hasPrev,
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
