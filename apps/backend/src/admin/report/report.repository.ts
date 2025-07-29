import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, gte, sql, sum, lte, inArray, eq } from 'drizzle-orm';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { BaseRepository } from 'src/common/base.repository';
import { bookings, profiles, slots } from '@sportefy/db-types';
import { subDays } from 'date-fns';

@Injectable()
export class ReportRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  /**
   * Calculates total revenue for a given day.
   */
  async getDailyRevenue(date: Date) {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const result = await this.db
      .select({
        total: sum(bookings.totalCredits),
      })
      .from(bookings)
      .where(
        and(
          gte(bookings.createdAt, startOfDay),
          lte(bookings.createdAt, endOfDay),
          // Only count revenue from confirmed/completed bookings
          inArray(bookings.status, ['confirmed', 'completed']),
        ),
      );

    return result[0]?.total || 0;
  }

  /**
   * Calculates booking counts for each of the last 7 days.
   */
  async getBookingTrends() {
    const sevenDaysAgo = subDays(new Date(), 7);

    // This query groups bookings by the day they were created
    const result = await this.db
      .select({
        date: sql<string>`DATE(bookings.created_at)`,
        count: count(bookings.id),
      })
      .from(bookings)
      .where(gte(bookings.createdAt, sevenDaysAgo))
      .groupBy(sql`DATE(bookings.created_at)`)
      .orderBy(sql`DATE(bookings.created_at)`);

    return result;
  }

  /**
   * Finds the most frequently booked time slots.
   */
  async getPopularTimeSlots() {
    const result = await this.db
      .select({
        startTime: slots.startTime,
        bookingCount: count(slots.id),
      })
      .from(slots)
      .where(eq(slots.eventType, 'booking'))
      .groupBy(slots.startTime)
      .orderBy(desc(count(slots.id)))
      .limit(5); // Get top 5 popular slots

    return result;
  }
}
