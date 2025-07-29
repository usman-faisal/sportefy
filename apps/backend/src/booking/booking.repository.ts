import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewBooking, Booking, bookings } from '@sportefy/db-types';
import { SQL, and, count, eq, gte, inArray, lt } from 'drizzle-orm';
import { DrizzleTransaction, SqlUnknown } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { IncludeRelation, InferResultType } from 'src/database/utils';
import { matches, slots } from '@sportefy/db-types';
import { SlotEventType } from 'src/common/types';
import { endOfDay, startOfDay } from 'date-fns';

export type BookingsWithInput = NonNullable<
  Parameters<DrizzleClient['query']['bookings']['findFirst']>[0]
>['with'];
export type BookingsWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['bookings']['findFirst']>[0]
>['where'];
export type BookingsUpdateWhereInput = SQL<unknown>;
export type BookingsOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['bookings']['findMany']>[0]
>['orderBy'];

@Injectable()
export class BookingRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async getBooking<TWith extends IncludeRelation<'bookings'>>(
    where: BookingsWhereInput,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'bookings', TWith> | undefined> {
    const dbClient = tx || this.db;
    const booking = await dbClient.query.bookings.findFirst({
      where,
      with: withRelations,
    });

    return booking;
  }

  async getBookingById<TWith extends IncludeRelation<'bookings'>>(
    bookingId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'bookings', TWith> | undefined> {
    const dbClient = tx || this.db;
    const booking = await dbClient.query.bookings.findFirst({
      where: (bookings, { eq }) => eq(bookings.id, bookingId),
      with: withRelations,
    });

    return booking;
  }

  async getManyBookings<TWith extends IncludeRelation<'bookings'>>(
    where: SqlUnknown,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: BookingsOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'bookings', TWith>[]> {
    const dbClient = tx || this.db;
    const bookingsList = await dbClient.query.bookings.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return bookingsList;
  }

  // async getManyBookings<TWith extends IncludeRelation<'bookings'>>(
  //   where: SqlUnknown,
  //   limit?: number,
  //   offset?: number,
  //   tx?: DrizzleTransaction,
  // ): Promise<InferResultType<'bookings'>[]> {
  //   const dbClient = tx || this.db;
  //   const bookingsList = await dbClient
  //     .select()
  //     .from(bookings)
  //     .where(where)
  //     .limit(limit ?? 10)
  //     .offset(offset ?? 10);
  //   // const bookingsList = await dbClient.query.bookings.findMany({
  //   //   where,
  //   //   with: withRelations,
  //   //   limit,
  //   //   offset,
  //   //   orderBy,
  //   // });

  //   return bookingsList;
  // }

  async createBooking(
    data: NewBooking,
    tx?: DrizzleTransaction,
  ): Promise<Booking> {
    const dbClient = tx || this.db;
    const booking = await dbClient.insert(bookings).values(data).returning();

    return booking[0];
  }

  async updateBooking(
    where: BookingsUpdateWhereInput,
    data: Partial<NewBooking>,
    tx?: DrizzleTransaction,
  ): Promise<Booking[]> {
    const dbClient = tx || this.db;
    const updatedBooking = await dbClient
      .update(bookings)
      .set(data)
      .where(where)
      .returning();

    return updatedBooking;
  }

  async updateBookingById(
    id: string,
    data: Partial<NewBooking>,
    tx?: DrizzleTransaction,
  ): Promise<Booking[]> {
    return this.updateBooking(eq(bookings.id, id), data, tx);
  }

  async deleteBooking(
    where: BookingsUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<Booking[]> {
    const dbClient = tx || this.db;
    const deletedBooking = await dbClient
      .delete(bookings)
      .where(where)
      .returning();

    return deletedBooking;
  }

  async deleteBookingById(
    id: string,
    tx?: DrizzleTransaction,
  ): Promise<Booking[]> {
    return this.deleteBooking(eq(bookings.id, id), tx);
  }

  async count(
    where?: BookingsUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(bookings);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }

  async getBookingsWithJoinedSlot(
    where: SqlUnknown,
    tx?: DrizzleTransaction,
  ): Promise<
    {
      slot: typeof slots.$inferSelect;
      booking: typeof bookings.$inferSelect;
      match: typeof matches.$inferSelect;
    }[]
  > {
    const dbClient = tx || this.db;

    const result = await dbClient
      .select({
        slot: slots,
        booking: bookings,
        match: matches,
      })
      .from(bookings)
      .innerJoin(
        slots,
        and(
          eq(slots.eventId, bookings.id),
          eq(slots.eventType, SlotEventType.BOOKING),
        ),
      )
      .innerJoin(matches, eq(matches.bookingId, bookings.id))
      .where(where);

    return result;
  }

  async findBookingsByDate(date: Date, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    const start = startOfDay(date);
    const end = endOfDay(date);

    return dbClient
      .select({
        booking: bookings,
        slot: slots,
        venue: bookings.venueId,
      })
      .from(bookings)
      .innerJoin(slots, eq(slots.eventId, bookings.id))
      .where(
        and(
          inArray(bookings.status, ['confirmed', 'completed']),
          gte(slots.startTime, start),
          lt(slots.startTime, end),
          eq(slots.eventType, SlotEventType.BOOKING),
        ),
      );
  }
}
